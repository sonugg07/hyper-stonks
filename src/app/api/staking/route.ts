import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidEvmAddress } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let settings = await prisma.stakingSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.stakingSettings.create({
        data: {
          id: "default",
          isActive: false, // OFF by default
          apyPercent: 42.5,
          minStake: 0.1,
          maxStake: 50.0,
          lockDurationDays: 30,
          rewardTokenSymbol: "$STONKS",
          contractAddress: "0x99A87C6F67e0eD40360a0a86B91054E83b4Bf2F1",
          chain: "Ethereum Mainnet",
          chainId: 1,
          totalStaked: 842.6,
        },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching staking settings:", error);
    return NextResponse.json(
      {
        success: true,
        data: {
          isActive: false,
          apyPercent: 42.5,
          minStake: 0.1,
          maxStake: 50.0,
          lockDurationDays: 30,
          rewardTokenSymbol: "$STONKS",
          contractAddress: "0x99A87C6F67e0eD40360a0a86B91054E83b4Bf2F1",
          chain: "Ethereum Mainnet",
          chainId: 1,
          totalStaked: 842.6,
        },
      },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, walletAddress, amount } = body; // action: "STAKE" | "UNSTAKE" | "CLAIM"

    const settings = await prisma.stakingSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings || !settings.isActive) {
      return NextResponse.json(
        { success: false, error: "Staking is currently closed. Staking will be available soon." },
        { status: 403 }
      );
    }

    if (!walletAddress || !isValidEvmAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: "Invalid EVM wallet address." },
        { status: 400 }
      );
    }

    const stakeAmount = Number(amount) || 0;

    if (action === "STAKE") {
      if (stakeAmount < settings.minStake) {
        return NextResponse.json(
          { success: false, error: `Minimum stake amount is ${settings.minStake} ETH.` },
          { status: 400 }
        );
      }

      await prisma.stakingSettings.update({
        where: { id: "default" },
        data: { totalStaked: { increment: stakeAmount } },
      });

      return NextResponse.json({
        success: true,
        data: {
          action: "STAKE",
          amount: stakeAmount,
          message: `Successfully staked ${stakeAmount} ETH into Hype Stonks Vault!`,
          txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
          isDemoTransaction: true,
        },
      });
    } else if (action === "CLAIM") {
      return NextResponse.json({
        success: true,
        data: {
          action: "CLAIM",
          amount: 250,
          token: settings.rewardTokenSymbol,
          message: `Successfully claimed 250 ${settings.rewardTokenSymbol} rewards!`,
          txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
          isDemoTransaction: true,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Action processed." });
  } catch (error: any) {
    console.error("Staking action error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process staking request." },
      { status: 500 }
    );
  }
}
