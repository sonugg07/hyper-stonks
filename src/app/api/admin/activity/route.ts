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
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "30", 10)));
    const actionFilter = searchParams.get("action");

    const where: any = {};
    if (actionFilter && actionFilter !== "ALL") {
      where.action = actionFilter;
    }

    const activities = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("[Admin Activity GET Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch activity logs." },
      { status: 500 }
    );
  }
}
