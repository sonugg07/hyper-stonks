import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));

    if (!id) {
      return NextResponse.json({ success: false, error: "Task ID is required." }, { status: 400 });
    }

    const updatedQuest = await prisma.quest.update({
      where: { id },
      data: {
        title: body.title !== undefined ? String(body.title).trim() : undefined,
        description: body.description !== undefined ? String(body.description).trim() : undefined,
        taskType: body.taskType !== undefined ? String(body.taskType).trim() : undefined,
        url: body.url !== undefined ? (body.url ? String(body.url).trim() : null) : undefined,
        points: body.points !== undefined ? Number(body.points) : undefined,
        verificationType: body.verificationType !== undefined ? String(body.verificationType).trim() : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
        orderIndex: body.orderIndex !== undefined ? Number(body.orderIndex) : undefined,
      },
    });

    // Record Activity Log
    try {
      await prisma.activityLog.create({
        data: {
          actor: "Admin",
          action: "TASK_UPDATED",
          details: `Updated task #${updatedQuest.orderIndex}: "${updatedQuest.title}" (${updatedQuest.taskType} / +${updatedQuest.points} PTS)`,
        },
      });
    } catch {
      // ignore
    }

    // Invalidate Next.js cache
    try {
      revalidatePath("/waitlist");
      revalidatePath("/quests");
      revalidatePath("/api/quests");
      revalidatePath("/admin/quests");
    } catch {
      // ignore
    }

    return NextResponse.json(
      { success: true, data: updatedQuest },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("[Task Update Error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = params;
    await prisma.questSubmission.deleteMany({ where: { questId: id } });
    await prisma.quest.delete({ where: { id } });

    try {
      revalidatePath("/waitlist");
      revalidatePath("/quests");
      revalidatePath("/api/quests");
      revalidatePath("/admin/quests");
    } catch {
      // ignore
    }

    return NextResponse.json(
      { success: true, message: "Quest deleted successfully" },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("[Task Delete Error]:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to delete task" }, { status: 500 });
  }
}
