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
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const filter = searchParams.get("filter") || "ALL"; // ALL, BANNED, ACTIVE
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10", 10)));

    const where: any = {};
    if (filter === "BANNED") where.isBanned = true;
    if (filter === "ACTIVE") where.isBanned = false;

    if (search) {
      where.OR = [
        { xHandle: { contains: search } },
        { walletAddress: { contains: search } },
        { referralCode: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { totalPoints: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          submissions: true,
          referralsMade: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formatted = users.map((u: any) => ({
      id: u.id,
      xHandle: u.xHandle ? `@${u.xHandle}` : "N/A",
      walletAddress: u.walletAddress,
      totalPoints: u.totalPoints,
      questsCompleted: u.submissions.filter((s: any) => s.status === "APPROVED").length,
      referralsCount: u.referralsMade.length,
      isBanned: u.isBanned,
      role: u.role,
      joinedAt: u.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: {
        users: formatted,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}
