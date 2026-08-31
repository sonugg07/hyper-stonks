import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidEvmAddress, generateReferralCode } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      xHandle,
      commentUrl,
      walletAddress,
      tasksCompleted, // array of quest IDs completed
      captchaToken,
      referralCodeUsed,
    } = body;

    // 1. Validate EVM Wallet Address
    if (!walletAddress || !isValidEvmAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: "Invalid EVM wallet address. Must be 42 characters starting with 0x." },
        { status: 400 }
      );
    }

    // 2. Validate X handle
    if (!xHandle || xHandle.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid X handle (e.g. @yourhandle)." },
        { status: 400 }
      );
    }

    const cleanXHandle = xHandle.trim().replace(/^@+/, "");
    const cleanWallet = walletAddress.trim().toLowerCase();

    // 3. Duplicate submission check
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

    if (existingUser && existingUser.submissions.length > 0) {
      // Check if user already submitted the primary entry
      const hasCompleted = existingUser.submissions.some((s: any) => s.status === "APPROVED" || s.status === "PENDING");
      if (hasCompleted) {
        return NextResponse.json(
          {
            success: false,
            error: "Entry already submitted for this wallet or X handle. Duplicate submissions are not permitted.",
            isDuplicate: true,
            submissionId: existingUser.submissions[0]?.id,
          },
          { status: 409 }
        );
      }
    }

    // 4. Fetch all active quests to calculate points
    const activeQuests = await prisma.quest.findMany({
      where: { isActive: true },
    });

    let totalEarnedPoints = 0;
    const submissionId = "HS-" + Math.floor(100000 + Math.random() * 900000);

    // Calculate total points for all completed tasks (or full starter quest bundle)
    for (const q of activeQuests) {
      totalEarnedPoints += q.points;
    }

    // 5. Check referral bonus
    let referrerUser = null;
    let referralBonus = 0;
    if (referralCodeUsed && referralCodeUsed.trim()) {
      referrerUser = await prisma.user.findUnique({
        where: { referralCode: referralCodeUsed.trim().toUpperCase() },
      });

      // Prevent self-referral
      if (referrerUser && referrerUser.walletAddress.toLowerCase() !== cleanWallet) {
        referralBonus = 250;
      }
    }

    // 6. Create or update User record
    const userReferralCode = generateReferralCode();

    const user = await prisma.user.upsert({
      where: { walletAddress: cleanWallet },
      update: {
        xHandle: cleanXHandle,
        totalPoints: { increment: totalEarnedPoints },
        referredBy: referrerUser ? referrerUser.referralCode : undefined,
      },
      create: {
        walletAddress: cleanWallet,
        xHandle: cleanXHandle,
        referralCode: userReferralCode,
        referredBy: referrerUser ? referrerUser.referralCode : undefined,
        totalPoints: totalEarnedPoints,
        role: "USER",
      },
    });

    // 7. Create Quest Submissions for each task
    const submissionPromises = activeQuests.map((quest: any) => {
      let submittedData = cleanXHandle;
      if (quest.taskType === "COMMENT_X" && commentUrl) {
        submittedData = commentUrl;
      } else if (quest.taskType === "WALLET_CONNECT") {
        submittedData = cleanWallet;
      }

      return prisma.questSubmission.create({
        data: {
          id: `${submissionId}-${quest.slug}`,
          userId: user.id,
          questId: quest.id,
          walletAddress: cleanWallet,
          submittedData,
          status: "APPROVED", // Auto-approved for verified quest entry
          pointsAwarded: quest.points,
          proofUrl: commentUrl || `https://x.com/${cleanXHandle}`,
          verifiedAt: new Date(),
        },
      });
    });

    await Promise.all(submissionPromises);

    // 8. Record points transaction
    await prisma.pointsTransaction.create({
      data: {
        userId: user.id,
        amount: totalEarnedPoints,
        type: "QUEST_REWARD",
        description: "Completed Hype Stonks Launch Quests",
        referenceId: submissionId,
      },
    });

    // 9. If valid referrer, award points to referrer
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
    }

    return NextResponse.json({
      success: true,
      data: {
        submissionId,
        timestamp: new Date().toISOString(),
        pointsEarned: totalEarnedPoints,
        totalUserPoints: user.totalPoints,
        questsCompleted: activeQuests.length,
        walletAddress: cleanWallet,
        xHandle: `@${cleanXHandle}`,
        referralCode: user.referralCode,
        message: "Entry submitted successfully! Points added to your account.",
      },
    });
  } catch (error: any) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process quest submission." },
      { status: 500 }
    );
  }
}
