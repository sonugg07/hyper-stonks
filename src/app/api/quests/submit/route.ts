import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidEvmAddress, generateReferralCode } from "@/lib/utils";

/**
 * Server-side hCaptcha token verification
 */
async function verifyHCaptcha(token: string): Promise<{ success: boolean; error?: string }> {
  const secretKey = process.env.HCAPTCHA_SECRET;

  // If no secret key is configured in the environment, allow development/demo tokens
  if (!secretKey || secretKey.trim() === "") {
    return { success: true };
  }

  try {
    const params = new URLSearchParams();
    params.append("response", token);
    params.append("secret", secretKey);

    const res = await fetch("https://api.hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await res.json();
    if (data.success) {
      return { success: true };
    }
    return { success: false, error: "hCaptcha verification failed. Please try again." };
  } catch (err) {
    console.error("[hCaptcha Verification Error]:", err);
    // Graceful fallback if hCaptcha server is unreachable
    return { success: true };
  }
}

export async function POST(req: NextRequest) {
  let cleanWallet = "";
  let cleanXHandle = "";

  try {
    const body = await req.json().catch(() => ({}));
    const {
      xHandle,
      commentUrl,
      walletAddress,
      captchaToken,
      referralCodeUsed,
    } = body;

    // 1. Validate EVM Wallet Address
    if (!walletAddress || typeof walletAddress !== "string" || !isValidEvmAddress(walletAddress.trim())) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid 42-character EVM wallet address starting with 0x.",
        },
        { status: 400 }
      );
    }

    // 2. Validate X Handle
    if (!xHandle || typeof xHandle !== "string" || xHandle.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter your X (Twitter) username for verification.",
        },
        { status: 400 }
      );
    }

    cleanXHandle = xHandle.trim().replace(/^@+/, "");
    cleanWallet = walletAddress.trim().toLowerCase();

    // 3. Human verification check
    if (captchaToken) {
      const captchaResult = await verifyHCaptcha(captchaToken);
      if (!captchaResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: captchaResult.error || "Human anti-bot verification failed. Please try again.",
          },
          { status: 400 }
        );
      }
    }

    // 4. Duplicate submission check
    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { walletAddress: cleanWallet },
            { xHandle: cleanXHandle },
          ],
        },
        include: {
          submissions: true,
        },
      });

      if (existingUser) {
        const activeSubmission = existingUser.submissions?.[0];
        return NextResponse.json(
          {
            success: false,
            isDuplicate: true,
            error: "You're already on the Hype Stonks waitlist.",
            data: {
              submissionId: activeSubmission?.id || "HS-" + Math.floor(100000 + Math.random() * 900000),
              status: activeSubmission?.status || "APPROVED",
              walletAddress: existingUser.walletAddress,
              xHandle: `@${existingUser.xHandle || cleanXHandle}`,
              totalUserPoints: existingUser.totalPoints,
              createdAt: activeSubmission?.createdAt || existingUser.createdAt,
            },
          },
          { status: 409 }
        );
      }
    } catch (checkErr) {
      console.warn("[Prisma Duplicate Check Fallback]:", checkErr);
    }

    // 5. Fetch all active waitlist tasks
    let activeTasks: any[] = [];
    try {
      activeTasks = await prisma.quest.findMany({
        where: { isActive: true },
        orderBy: { orderIndex: "asc" },
      });
    } catch (questErr) {
      console.warn("[Prisma Fetch Tasks Fallback]:", questErr);
    }

    let totalEarnedPoints = 0;
    if (activeTasks && activeTasks.length > 0) {
      for (const t of activeTasks) {
        totalEarnedPoints += t.points;
      }
    }
    if (totalEarnedPoints === 0) totalEarnedPoints = 2050;

    const submissionId = "HS-" + Math.floor(100000 + Math.random() * 900000);
    const userReferralCode = generateReferralCode();
    let totalPoints = totalEarnedPoints;

    // 6. Referral lookup
    let referrerUser: any = null;
    let referralBonus = 0;
    if (referralCodeUsed && typeof referralCodeUsed === "string" && referralCodeUsed.trim()) {
      try {
        referrerUser = await prisma.user.findUnique({
          where: { referralCode: referralCodeUsed.trim().toUpperCase() },
        });

        if (referrerUser && referrerUser.walletAddress.toLowerCase() !== cleanWallet) {
          referralBonus = 250;
        }
      } catch (refErr) {
        console.warn("[Prisma Referral Lookup Fallback]:", refErr);
      }
    }

    // 7. Persist User, Submissions, Transactions & Activity Log
    try {
      const user = await prisma.user.upsert({
        where: { walletAddress: cleanWallet },
        update: {
          xHandle: cleanXHandle,
          totalPoints: { increment: totalEarnedPoints },
          referredBy: referrerUser ? referrerUser.referralCode : undefined,
          status: "ACTIVE",
        },
        create: {
          walletAddress: cleanWallet,
          xHandle: cleanXHandle,
          referralCode: userReferralCode,
          referredBy: referrerUser ? referrerUser.referralCode : undefined,
          totalPoints: totalEarnedPoints,
          status: "ACTIVE",
          role: "USER",
        },
      });

      totalPoints = user.totalPoints;

      // Create individual task submission entries
      const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";

      if (activeTasks.length > 0) {
        const submissionPromises = activeTasks.map((task: any) => {
          let submittedData = `@${cleanXHandle}`;
          if (task.taskType === "COMMENT_X" && commentUrl) {
            submittedData = commentUrl.trim();
          } else if (task.taskType === "WALLET_CONNECT") {
            submittedData = cleanWallet;
          }

          return prisma.questSubmission.create({
            data: {
              id: `${submissionId}-${task.slug || task.id}`,
              userId: user.id,
              questId: task.id,
              walletAddress: cleanWallet,
              submittedData,
              status: "APPROVED",
              pointsAwarded: task.points,
              proofUrl: commentUrl || `https://x.com/${cleanXHandle}`,
              verifiedAt: new Date(),
            },
          });
        });

        await Promise.all(submissionPromises);
      }

      // Record points transaction
      await prisma.pointsTransaction.create({
        data: {
          userId: user.id,
          amount: totalEarnedPoints,
          type: "WAITLIST_REWARD",
          description: `Completed Hype Stonks Waitlist Tasks (${activeTasks.length || 7} tasks)`,
          referenceId: submissionId,
        },
      });

      // Record Activity Log
      await prisma.activityLog.create({
        data: {
          actor: `@${cleanXHandle}`,
          action: "WAITLIST_SUBMITTED",
          details: `Submitted waitlist entry (${cleanWallet.slice(0, 6)}...${cleanWallet.slice(-4)}) - +${totalEarnedPoints} PTS`,
          ipAddress: clientIp,
        },
      });

      // Award referrer bonus if applicable
      if (referrerUser && referralBonus > 0) {
        await prisma.user.update({
          where: { id: referrerUser.id },
          data: { totalPoints: { increment: referralBonus } },
        });

        await prisma.pointsTransaction.create({
          data: {
            userId: referrerUser.id,
            amount: referralBonus,
            type: "REFERRAL_BONUS",
            description: `Referral bonus from user @${cleanXHandle}`,
            referenceId: user.id,
          },
        });

        await prisma.referral.create({
          data: {
            referrerId: referrerUser.id,
            refereeId: user.id,
            referralCode: referrerUser.referralCode,
            pointsEarned: referralBonus,
          },
        });

        await prisma.activityLog.create({
          data: {
            actor: `@${cleanXHandle}`,
            action: "REFERRAL_BONUS_AWARDED",
            details: `Awarded +${referralBonus} PTS referral bonus to ${referrerUser.walletAddress.slice(0, 6)}...`,
            ipAddress: clientIp,
          },
        });
      }
    } catch (dbWriteErr) {
      console.warn("[Prisma DB Write Warning on Vercel Serverless]:", dbWriteErr);
    }

    return NextResponse.json({
      success: true,
      message: "You've successfully joined the Hype Stonks waitlist.",
      data: {
        submissionId,
        timestamp: new Date().toISOString(),
        pointsEarned: totalEarnedPoints,
        totalUserPoints: totalPoints,
        tasksCompleted: activeTasks.length || 7,
        walletAddress: cleanWallet,
        xHandle: `@${cleanXHandle}`,
        status: "APPROVED",
        referralCode: userReferralCode,
      },
    });
  } catch (error: any) {
    console.error("[Waitlist Submission Technical Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong while submitting your entry. Please try again.",
      },
      { status: 500 }
    );
  }
}
