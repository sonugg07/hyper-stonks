import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidEvmAddress } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let settings = await prisma.mintSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.mintSettings.create({
        data: {
          id: "default",
          isActive: false, // OFF by default
          priceEth: 0.08,
          maxSupply: 3333,
          mintedCount: 1420,
          maxPerWallet: 3,
          contractAddress: "0x38B76a6D8F1Eb856F52575C7E7799d1912808Ea7",
          chain: "Ethereum Mainnet",
          chainId: 1,
        },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching mint settings:", error);
    return NextResponse.json(
      {
        success: true,
        data: {
          isActive: false,
          priceEth: 0.08,
          maxSupply: 3333,
          mintedCount: 1420,
          maxPerWallet: 3,
          contractAddress: "0x38B76a6D8F1Eb856F52575C7E7799d1912808Ea7",
          chain: "Ethereum Mainnet",
          chainId: 1,
        },
      },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, quantity } = body;

    const settings = await prisma.mintSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings || !settings.isActive) {
      return NextResponse.json(
        { success: false, error: "Mint is currently closed. Please check back later." },
        { status: 403 }
      );
    }

    if (!walletAddress || !isValidEvmAddress(walletAddress)) {
      return NextResponse.json(
        { success: false, error: "Invalid EVM wallet address." },
        { status: 400 }
      );
    }

    const mintQty = Math.max(1, Math.min(settings.maxPerWallet, Number(quantity) || 1));

    if (settings.mintedCount + mintQty > settings.maxSupply) {
      return NextResponse.json(
        { success: false, error: "Requested quantity exceeds available supply." },
        { status: 400 }
      );
    }

    // Increment minted count
    const updated = await prisma.mintSettings.update({
      where: { id: "default" },
      data: { mintedCount: { increment: mintQty } },
    });

    const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    return NextResponse.json({
      success: true,
      data: {
        message: `Successfully minted ${mintQty} Hype Stonks NFT${mintQty > 1 ? "s" : ""}!`,
        quantity: mintQty,
        totalMinted: updated.mintedCount,
        maxSupply: updated.maxSupply,
        priceEth: settings.priceEth * mintQty,
        txHash,
        isDemoTransaction: true,
      },
    });
  } catch (error: any) {
    console.error("Mint execution error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process mint request." },
      { status: 500 }
    );
  }
}
