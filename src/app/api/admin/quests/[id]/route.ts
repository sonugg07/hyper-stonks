import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

    const updatedQuest = await prisma.quest.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        taskType: body.taskType,
        url: body.url,
        points: body.points !== undefined ? Number(body.points) : undefined,
        verificationType: body.verificationType,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        orderIndex: body.orderIndex !== undefined ? Number(body.orderIndex) : undefined,
      },
    });

    return NextResponse.json({ success: true, data: updatedQuest });
  } catch (error) {
    console.error("Error updating quest:", error);
    return NextResponse.json({ success: false, error: "Failed to update quest" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    await prisma.questSubmission.deleteMany({ where: { questId: id } });
    await prisma.quest.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Quest deleted successfully" });
  } catch (error) {
    console.error("Error deleting quest:", error);
    return NextResponse.json({ success: false, error: "Failed to delete quest" }, { status: 500 });
  }
}
