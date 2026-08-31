import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // PENDING, APPROVED, REJECTED
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "15", 10)));

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const [submissions, total] = await Promise.all([
      prisma.questSubmission.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: true,
          quest: true,
        },
      }),
      prisma.questSubmission.count({ where }),
    ]);

    const formatted = submissions.map((s: any) => ({
      id: s.id,
      userHandle: s.user?.xHandle ? `@${s.user.xHandle}` : "Anonymous",
      userId: s.userId,
      walletAddress: s.walletAddress,
      taskTitle: s.quest?.title || "Task",
      taskType: s.quest?.taskType,
      submittedData: s.submittedData,
      status: s.status,
      points: s.pointsAwarded || s.quest?.points || 100,
      rejectionReason: s.rejectionReason,
      createdAt: s.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        submissions: formatted,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Admin submissions error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch submissions" }, { status: 500 });
  }
}
