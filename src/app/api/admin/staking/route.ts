import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stakingSettings = await prisma.stakingSettings.findUnique({
      where: { id: "default" },
    });
    return NextResponse.json({ success: true, data: stakingSettings });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch staking settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const updated = await prisma.stakingSettings.upsert({
      where: { id: "default" },
      update: {
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        apyPercent: body.apyPercent !== undefined ? Number(body.apyPercent) : undefined,
        minStake: body.minStake !== undefined ? Number(body.minStake) : undefined,
        maxStake: body.maxStake !== undefined ? Number(body.maxStake) : undefined,
        lockDurationDays: body.lockDurationDays !== undefined ? Number(body.lockDurationDays) : undefined,
        rewardTokenSymbol: body.rewardTokenSymbol || undefined,
        contractAddress: body.contractAddress || undefined,
        chain: body.chain || undefined,
        chainId: body.chainId !== undefined ? Number(body.chainId) : undefined,
      },
      create: {
        id: "default",
        isActive: body.isActive || false,
        apyPercent: Number(body.apyPercent) || 42.5,
        minStake: Number(body.minStake) || 0.1,
        maxStake: Number(body.maxStake) || 50.0,
        lockDurationDays: Number(body.lockDurationDays) || 30,
        rewardTokenSymbol: body.rewardTokenSymbol || "$STONKS",
        contractAddress: body.contractAddress || "0x99A87C6F67e0eD40360a0a86B91054E83b4Bf2F1",
        chain: body.chain || "Ethereum Mainnet",
        chainId: Number(body.chainId) || 1,
        totalStaked: 842.6,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating staking settings:", error);
    return NextResponse.json({ success: false, error: "Failed to update staking settings" }, { status: 500 });
  }
}
