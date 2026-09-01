import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "15", 10)));

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { walletAddress: { contains: search } },
        { submittedData: { contains: search } },
        { user: { xHandle: { contains: search } } },
      ];
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
      }).catch(() => []),
      prisma.questSubmission.count({ where }).catch(() => 0),
    ]);

    const formatted = (submissions || []).map((s: any, idx: number) => ({
      index: (page - 1) * limit + idx + 1,
      id: s.id,
      userId: s.userId,
      userHandle: s.user?.xHandle ? `@${s.user.xHandle}` : "Anonymous",
      walletAddress: s.walletAddress,
      taskTitle: s.quest?.title || "Waitlist Task",
      taskType: s.quest?.taskType,
      submittedValue: s.submittedData,
      proofUrl: s.proofUrl,
      status: s.status,
      points: s.pointsAwarded || s.quest?.points || 0,
      userTotalPoints: s.user?.totalPoints || 0,
      createdAt: s.createdAt,
      verifiedAt: s.verifiedAt,
      rejectionReason: s.rejectionReason,
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: formatted,
        total: total || 0,
        page,
        totalPages: Math.ceil((total || 0) / limit) || 1,
      },
    });
  } catch (error) {
    console.error("[Admin Waitlist GET Error]:", error);
    return NextResponse.json({
      success: true,
      data: {
        items: [],
        total: 0,
        page: 1,
        totalPages: 1,
      },
    });
  }
}
