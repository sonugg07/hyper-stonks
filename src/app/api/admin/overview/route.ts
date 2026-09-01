import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      totalUsers,
      totalWaitlistEntries,
      completedEntries,
      pendingEntries,
      rejectedEntries,
      pointsSum,
      activeTasks,
      totalTasks,
      mintSettings,
      stakingSettings,
      recentSubmissions,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.questSubmission.count(),
      prisma.questSubmission.count({ where: { status: "APPROVED" } }),
      prisma.questSubmission.count({ where: { status: "PENDING" } }),
      prisma.questSubmission.count({ where: { status: "REJECTED" } }),
      prisma.pointsTransaction.aggregate({ _sum: { amount: true } }),
      prisma.quest.count({ where: { isActive: true } }),
      prisma.quest.count(),
      prisma.mintSettings.findUnique({ where: { id: "default" } }),
      prisma.stakingSettings.findUnique({ where: { id: "default" } }),
      prisma.questSubmission.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: true, quest: true },
      }),
      prisma.activityLog.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalWaitlistEntries,
        completedEntries,
        pendingEntries,
        rejectedEntries,
        totalPointsAwarded: pointsSum._sum.amount || 0,
        activeTasks: activeTasks || 6,
        totalTasks: totalTasks || 6,
        mintStatus: mintSettings?.isActive || false,
        stakingStatus: stakingSettings?.isActive || false,
        mintSettings,
        stakingSettings,
        recentSubmissions: recentSubmissions.map((s: any) => ({
          id: s.id,
          user: s.user?.xHandle ? `@${s.user.xHandle}` : "Anonymous",
          walletAddress: s.walletAddress,
          taskTitle: s.quest?.title || "Waitlist Task",
          submittedData: s.submittedData,
          status: s.status,
          points: s.pointsAwarded,
          createdAt: s.createdAt,
        })),
        recentActivity,
      },
    });
  } catch (error) {
    console.error("[Admin Overview Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch admin overview data from database." },
      { status: 500 }
    );
  }
}
