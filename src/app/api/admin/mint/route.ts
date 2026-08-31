import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const mintSettings = await prisma.mintSettings.findUnique({
      where: { id: "default" },
    });
    return NextResponse.json({ success: true, data: mintSettings });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch mint settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const updated = await prisma.mintSettings.upsert({
      where: { id: "default" },
      update: {
        isActive: body.isActive !== undefined ? body.isActive : undefined,
        priceEth: body.priceEth !== undefined ? Number(body.priceEth) : undefined,
        maxSupply: body.maxSupply !== undefined ? Number(body.maxSupply) : undefined,
        maxPerWallet: body.maxPerWallet !== undefined ? Number(body.maxPerWallet) : undefined,
        contractAddress: body.contractAddress || undefined,
        chain: body.chain || undefined,
        chainId: body.chainId !== undefined ? Number(body.chainId) : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
      create: {
        id: "default",
        isActive: body.isActive || false,
        priceEth: Number(body.priceEth) || 0.08,
        maxSupply: Number(body.maxSupply) || 3333,
        mintedCount: 1420,
        maxPerWallet: Number(body.maxPerWallet) || 3,
        contractAddress: body.contractAddress || "0x38B76a6D8F1Eb856F52575C7E7799d1912808Ea7",
        chain: body.chain || "Ethereum Mainnet",
        chainId: Number(body.chainId) || 1,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating mint settings:", error);
    return NextResponse.json({ success: false, error: "Failed to update mint settings" }, { status: 500 });
  }
}
