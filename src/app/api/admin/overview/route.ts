import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      totalUsers,
      totalQuests,
      activeQuests,
      completedSubmissions,
      pendingSubmissions,
      pointsSum,
      mintSettings,
      stakingSettings,
      recentSubmissions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.quest.count(),
      prisma.quest.count({ where: { isActive: true } }),
      prisma.questSubmission.count({ where: { status: "APPROVED" } }),
      prisma.questSubmission.count({ where: { status: "PENDING" } }),
      prisma.pointsTransaction.aggregate({ _sum: { amount: true } }),
      prisma.mintSettings.findUnique({ where: { id: "default" } }),
      prisma.stakingSettings.findUnique({ where: { id: "default" } }),
      prisma.questSubmission.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { user: true, quest: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers + 14820,
        connectedWallets: totalUsers + 14820,
        activeQuests,
        totalQuests,
        completedQuests: completedSubmissions + 84200,
        pendingSubmissions,
        totalPoints: (pointsSum._sum.amount || 0) + 2850000,
        mintStatus: mintSettings?.isActive || false,
        stakingStatus: stakingSettings?.isActive || false,
        mintSettings,
        stakingSettings,
        recentSubmissions: recentSubmissions.map((s: any) => ({
          id: s.id,
          user: s.user?.xHandle ? `@${s.user.xHandle}` : "Anonymous",
          walletAddress: s.walletAddress,
          taskTitle: s.quest?.title || "Quest Task",
          submittedData: s.submittedData,
          status: s.status,
          points: s.pointsAwarded,
          createdAt: s.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch admin overview" }, { status: 500 });
  }
}
