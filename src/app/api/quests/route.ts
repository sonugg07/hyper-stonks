import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET all active waitlist tasks
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("all") === "true";

    const tasks = await prisma.quest.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { orderIndex: "asc" },
    });

    const registeredCount = await prisma.user.count();

    return NextResponse.json({
      success: true,
      data: tasks,
      registeredCount,
    });
  } catch (error) {
    console.error("[Tasks Fetch Error]:", error);
    return NextResponse.json(
      { success: false, error: "Unable to retrieve waitlist tasks." },
      { status: 500 }
    );
  }
}

// POST create new task (Admin only)
export async function POST(req: NextRequest) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { title, description, taskType, url, points, verificationType, isActive, orderIndex } = body;

    if (!title || !description || !taskType) {
      return NextResponse.json(
        { success: false, error: "Title, description, and task type are required." },
        { status: 400 }
      );
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

    const task = await prisma.quest.create({
      data: {
        slug,
        title: title.trim(),
        description: description.trim(),
        taskType,
        url: url ? url.trim() : null,
        points: Number(points) || 100,
        verificationType: verificationType || "HANDLE",
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        orderIndex: Number(orderIndex) || 0,
      },
    });

    // Record Activity Log
    await prisma.activityLog.create({
      data: {
        actor: "Admin",
        action: "TASK_CREATED",
        details: `Created new task: "${task.title}" (+${task.points} PTS)`,
      },
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("[Task Create Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create waitlist task." },
      { status: 500 }
    );
  }
}
