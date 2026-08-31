import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET all active quests for public quests page
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("all") === "true";

    const quests = await prisma.quest.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { orderIndex: "asc" },
    });

    const registeredCount = (await prisma.user.count()) + 14820;

    return NextResponse.json({
      success: true,
      data: quests,
      registeredCount,
    });
  } catch (error) {
    console.error("Error fetching quests:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch quests" }, { status: 500 });
  }
}

// POST create new quest (Admin only)
export async function POST(req: NextRequest) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, taskType, url, points, verificationType, isActive, orderIndex } = body;

    if (!title || !description || !taskType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

    const quest = await prisma.quest.create({
      data: {
        slug,
        title,
        description,
        taskType,
        url: url || null,
        points: Number(points) || 100,
        verificationType: verificationType || "HANDLE",
        isActive: isActive !== undefined ? isActive : true,
        orderIndex: Number(orderIndex) || 0,
      },
    });

    return NextResponse.json({ success: true, data: quest });
  } catch (error) {
    console.error("Error creating quest:", error);
    return NextResponse.json({ success: false, error: "Failed to create quest" }, { status: 500 });
  }
}
