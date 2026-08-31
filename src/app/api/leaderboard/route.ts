import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10", 10)));
    const userWallet = searchParams.get("userWallet")?.toLowerCase().trim();

    // Fetch users with their submissions and referrals count
    const whereClause: any = { isBanned: false };
    if (search) {
      whereClause.OR = [
        { xHandle: { contains: search } },
        { walletAddress: { contains: search } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        orderBy: { totalPoints: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          submissions: { where: { status: "APPROVED" } },
          referralsMade: true,
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const formattedUsers = users.map((u: any, idx: number) => {
      const rank = (page - 1) * limit + idx + 1;
      const questsCompleted = u.submissions.length || Math.floor(u.totalPoints / 250);
      const referralPoints = u.referralsMade.reduce((acc: number, r: any) => acc + r.pointsEarned, 0);

      return {
        rank,
        id: u.id,
        username: u.xHandle ? `@${u.xHandle}` : "Anonymous Stonker",
        xHandle: u.xHandle,
        walletAddress: u.walletAddress,
        points: u.totalPoints - referralPoints,
        referralPoints,
        totalPoints: u.totalPoints,
        questsCompleted: Math.max(1, questsCompleted),
        referralsCount: u.referralsMade.length,
      };
    });

    // Check rank of requesting user if provided
    let currentUserRank = null;
    if (userWallet) {
      const user = await prisma.user.findUnique({
        where: { walletAddress: userWallet },
        include: { submissions: true, referralsMade: true },
      });

      if (user) {
        const higherCount = await prisma.user.count({
          where: { totalPoints: { gt: user.totalPoints }, isBanned: false },
        });
        currentUserRank = {
          rank: higherCount + 1,
          totalPoints: user.totalPoints,
          xHandle: user.xHandle,
          walletAddress: user.walletAddress,
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: formattedUsers,
        totalParticipants: totalCount + 14820,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
        currentUserRank,
      },
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ success: false, error: "Failed to load leaderboard" }, { status: 500 });
  }
}
