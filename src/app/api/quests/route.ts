import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

const DEFAULT_TASKS = [
  {
    id: "task-follow-x",
    slug: "follow-x",
    orderIndex: 1,
    title: "Follow Hype Stonks on X",
    description: "Follow the official Hype Stonks account on X (Twitter).",
    taskType: "FOLLOW_X",
    url: "https://x.com/HypeStonks",
    points: 250,
    verificationType: "HANDLE",
    isActive: true,
  },
  {
    id: "task-like-x",
    slug: "like-x",
    orderIndex: 2,
    title: "Like Pinned Announcement",
    description: "Like the official Hype Stonks pinned launch announcement on X.",
    taskType: "LIKE_X",
    url: "https://x.com/HypeStonks/status/1890000000000000000",
    points: 150,
    verificationType: "HANDLE",
    isActive: true,
  },
  {
    id: "task-repost-x",
    slug: "repost-x",
    orderIndex: 3,
    title: "Repost Launch Announcement",
    description: "Repost / Retweet the official pinned announcement to spread the word.",
    taskType: "REPOST_X",
    url: "https://x.com/HypeStonks/status/1890000000000000000",
    points: 200,
    verificationType: "HANDLE",
    isActive: true,
  },
  {
    id: "task-comment-x",
    slug: "comment-x",
    orderIndex: 4,
    title: "Drop a Comment on X",
    description: "Leave a comment on the announcement post and drop your link.",
    taskType: "COMMENT_X",
    url: "https://x.com/HypeStonks/status/1890000000000000000",
    points: 300,
    verificationType: "URL",
    isActive: true,
  },
  {
    id: "task-connect-wallet",
    slug: "connect-wallet",
    orderIndex: 5,
    title: "Connect EVM Wallet Address",
    description: "Connect your Ethereum/Arbitrum/Base compatible Web3 wallet.",
    taskType: "WALLET_CONNECT",
    url: null,
    points: 500,
    verificationType: "WALLET",
    isActive: true,
  },
  {
    id: "task-join-telegram",
    slug: "join-telegram",
    orderIndex: 6,
    title: "Join Official Telegram",
    description: "Join the verified Hype Stonks alpha channel on Telegram.",
    taskType: "TELEGRAM",
    url: "https://t.me/hypestonks",
    points: 250,
    verificationType: "HANDLE",
    isActive: true,
  },
  {
    id: "task-join-discord",
    slug: "join-discord",
    orderIndex: 7,
    title: "Join Community Discord",
    description: "Join our discord server and claim the early community role.",
    taskType: "DISCORD",
    url: "https://discord.gg/hypestonks",
    points: 400,
    verificationType: "HANDLE",
    isActive: true,
  },
];

// GET all active waitlist tasks
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get("all") === "true";

    let tasks = await prisma.quest.findMany({
      where: includeInactive ? undefined : { isActive: true },
      orderBy: { orderIndex: "asc" },
    });

    if (!tasks || tasks.length === 0) {
      tasks = DEFAULT_TASKS as any;
    }

    let registeredCount = 14820;
    try {
      const dbCount = await prisma.user.count();
      registeredCount += dbCount;
    } catch (e) {
      // fallback
    }

    return NextResponse.json({
      success: true,
      data: tasks,
      registeredCount,
    });
  } catch (error) {
    console.warn("[Tasks Fetch Fallback]:", error);
    return NextResponse.json({
      success: true,
      data: DEFAULT_TASKS,
      registeredCount: 14820,
    });
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
    try {
      await prisma.activityLog.create({
        data: {
          actor: "Admin",
          action: "TASK_CREATED",
          details: `Created new task: "${task.title}" (+${task.points} PTS)`,
        },
      });
    } catch (e) {
      // ignore
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error("[Task Create Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create waitlist task." },
      { status: 500 }
    );
  }
}
