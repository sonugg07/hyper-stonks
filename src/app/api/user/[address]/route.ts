import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const rawAddress = params.address.toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { walletAddress: rawAddress },
      include: {
        submissions: {
          include: { quest: true },
        },
        referralsMade: true,
        pointsHistory: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    const totalQuests = await prisma.quest.count({ where: { isActive: true } });

    // If user doesn't exist yet, return initial empty user object with auto-generated referral code
    if (!user) {
      const generatedCode = generateReferralCode();
      return NextResponse.json({
        success: true,
        data: {
          exists: false,
          walletAddress: rawAddress,
          xHandle: null,
          referralCode: generatedCode,
          totalPoints: 0,
          rank: "-",
          completedQuestsCount: 0,
          totalQuestsCount: totalQuests,
          referralCount: 0,
          referralPoints: 0,
          mintedNfts: 0,
          stakedAmount: 0,
          stakingRewards: 0,
          completedQuests: [],
          recentTransactions: [],
          joinedDate: new Date().toISOString(),
        },
      });
    }

    // Calculate user rank
    const higherCount = await prisma.user.count({
      where: { totalPoints: { gt: user.totalPoints }, isBanned: false },
    });

    const referralPoints = user.referralsMade.reduce((sum: number, r: any) => sum + r.pointsEarned, 0);

    return NextResponse.json({
      success: true,
      data: {
        exists: true,
        id: user.id,
        walletAddress: user.walletAddress,
        xHandle: user.xHandle,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        totalPoints: user.totalPoints,
        rank: higherCount + 1,
        completedQuestsCount: user.submissions.filter((s: any) => s.status === "APPROVED").length,
        totalQuestsCount: totalQuests,
        referralCount: user.referralsMade.length,
        referralPoints,
        mintedNfts: 0,
        stakedAmount: 0,
        stakingRewards: 0,
        completedQuests: user.submissions.map((s: any) => ({
          id: s.questId,
          title: s.quest?.title || "Quest",
          status: s.status,
          points: s.pointsAwarded,
          submittedAt: s.createdAt,
        })),
        recentTransactions: user.pointsHistory,
        joinedDate: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("User profile error:", error);
    return NextResponse.json({ success: false, error: "Failed to load user profile" }, { status: 500 });
  }
}
