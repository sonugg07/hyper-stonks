import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        submissions: {
          include: { quest: true },
          orderBy: { createdAt: "desc" },
        },
        pointsHistory: {
          orderBy: { createdAt: "desc" },
        },
        referralsMade: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch user details" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const { totalPoints, isBanned, pointsAdjustmentReason } = body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (isBanned !== undefined) updateData.isBanned = isBanned;
    if (totalPoints !== undefined) {
      const diff = Number(totalPoints) - user.totalPoints;
      updateData.totalPoints = Number(totalPoints);

      if (diff !== 0) {
        await prisma.pointsTransaction.create({
          data: {
            userId: user.id,
            amount: diff,
            type: "ADMIN_ADJUSTMENT",
            description: pointsAdjustmentReason || "Admin manual points adjustment",
          },
        });
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 });
  }
}
