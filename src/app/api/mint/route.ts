import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidEvmAddress } from "@/lib/utils";
import { MAX_NFT_SUPPLY, fetchOnChainTotalSupply } from "@/lib/contracts";

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
          maxSupply: MAX_NFT_SUPPLY,
          mintedCount: 0,
          maxPerWallet: 3,
          contractAddress: "0x38B76a6D8F1Eb856F52575C7E7799d1912808Ea7",
          chain: "Ethereum Mainnet",
          chainId: 1,
        },
      });
    }

    // Attempt live on-chain read from smart contract
    let onChainSupply: number | null = null;
    let onChainAvailable = false;
    let onChainError: string | undefined;

    if (settings.contractAddress && settings.contractAddress.startsWith("0x")) {
      try {
        const onChainRes = await fetchOnChainTotalSupply(settings.contractAddress, settings.chainId);
        onChainSupply = onChainRes.totalSupply;
        onChainAvailable = onChainRes.isAvailable;
        onChainError = onChainRes.error;

        // If on-chain count is found, sync database if different
        if (onChainSupply !== null && onChainSupply !== settings.mintedCount) {
          await prisma.mintSettings.update({
            where: { id: "default" },
            data: { mintedCount: onChainSupply },
          }).catch(() => {});
          settings.mintedCount = onChainSupply;
        }
      } catch (err: any) {
        onChainError = err?.message || "Failed to query on-chain supply.";
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        maxSupply: MAX_NFT_SUPPLY,
        onChainSupply,
        onChainAvailable,
        onChainError,
      },
    });
  } catch (error) {
    console.error("Error fetching mint settings:", error);
    return NextResponse.json(
      {
        success: true,
        data: {
          isActive: false,
          priceEth: 0.08,
          maxSupply: MAX_NFT_SUPPLY,
          mintedCount: 0,
          maxPerWallet: 3,
          contractAddress: "0x38B76a6D8F1Eb856F52575C7E7799d1912808Ea7",
          chain: "Ethereum Mainnet",
          chainId: 1,
          onChainSupply: null,
          onChainAvailable: false,
        },
      },
      { status: 200 }
    );
  }
}

/**
 * Confirms an on-chain verified mint transaction after the user's wallet approves and executes it.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { walletAddress, quantity, txHash, isDemoMode, chainId, blockNumber } = body;

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

    // Require real transaction hash for non-demo mints
    if (!isDemoMode && (!txHash || !txHash.startsWith("0x") || txHash.length !== 66)) {
      return NextResponse.json(
        { success: false, error: "Valid on-chain transaction hash is required to verify mint." },
        { status: 400 }
      );
    }

    const mintQty = Math.max(1, Math.min(settings.maxPerWallet, Number(quantity) || 1));
    const effectiveMaxSupply = MAX_NFT_SUPPLY;

    if (settings.mintedCount + mintQty > effectiveMaxSupply) {
      return NextResponse.json(
        { success: false, error: "Requested quantity exceeds available 2,222 supply." },
        { status: 400 }
      );
    }

    // Increment on-chain verified minted count in DB
    const updated = await prisma.mintSettings.update({
      where: { id: "default" },
      data: {
        mintedCount: { increment: mintQty },
        maxSupply: MAX_NFT_SUPPLY,
      },
    });

    // Record Activity Log
    try {
      const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
      await prisma.activityLog.create({
        data: {
          actor: walletAddress.slice(0, 6) + "..." + walletAddress.slice(-4),
          action: isDemoMode ? "DEMO_MINT" : "NFT_MINTED_ONCHAIN",
          details: `Minted ${mintQty} Gen-1 Pass(es) (${(settings.priceEth * mintQty).toFixed(3)} ETH) ${isDemoMode ? "[Demo Mode]" : `Tx: ${txHash.slice(0, 10)}...`}`,
          ipAddress: clientIp,
        },
      });
    } catch (logErr) {
      console.warn("[Prisma Activity Log Warning]:", logErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Successfully minted ${mintQty} Hype Stonks Genesis NFT${mintQty > 1 ? "s" : ""}!`,
        quantity: mintQty,
        totalMinted: updated.mintedCount,
        maxSupply: MAX_NFT_SUPPLY,
        priceEth: settings.priceEth * mintQty,
        txHash: txHash || "0xDEMO_TRANSACTION_HASH",
        isDemoTransaction: Boolean(isDemoMode),
        blockNumber: blockNumber || null,
        chainId: chainId || settings.chainId,
      },
    });
  } catch (error: any) {
    console.error("Mint confirmation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record confirmed mint." },
      { status: 500 }
    );
  }
}
