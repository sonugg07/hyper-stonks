import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// GET all active waitlist tasks
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("all") === "true";

    const tasks = await prisma.quest.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { orderIndex: "asc" },
    });

    let registeredCount = 14820;
    try {
      const dbCount = await prisma.user.count();
      registeredCount += dbCount;
    } catch {
      // fallback
    }

    return NextResponse.json(
      {
        success: true,
        data: tasks,
        registeredCount,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      }
    );
  } catch (error: any) {
    console.error("[Tasks Fetch Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch tasks.",
        data: [],
      },
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
        taskType: String(taskType).trim(),
        url: url ? String(url).trim() : null,
        points: Number(points) || 100,
        verificationType: verificationType || "HANDLE",
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        orderIndex: Number(orderIndex) || 0,
      },
    });

    // Record Activity Log
    try {
      await prisma.activityLog.create({
        data: {
          actor: "Admin",
          action: "TASK_CREATED",
          details: `Created new task #${task.orderIndex}: "${task.title}" (+${task.points} PTS)`,
        },
      });
    } catch {
      // ignore
    }

    try {
      revalidatePath("/waitlist");
      revalidatePath("/quests");
      revalidatePath("/api/quests");
    } catch {
      // ignore
    }

    return NextResponse.json(
      { success: true, data: task },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("[Task Create Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create waitlist task." },
      { status: 500 }
    );
  }
}
