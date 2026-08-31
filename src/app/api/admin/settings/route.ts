import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          id: "default",
          projectName: "Hype Stonks",
          tagline: "Trade the Hype. Earn Your Position.",
          logoUrl: "/logo.svg",
          twitterUrl: "https://x.com/HypeStonks",
          discordUrl: "https://discord.gg/hypestonks",
          telegramUrl: "https://t.me/hypestonks",
          websiteUrl: "https://hype-stonks.io",
          maintenanceMode: false,
          questsEnabled: true,
          mintEnabled: false,
          stakingEnabled: false,
          referralsEnabled: true,
          referralRewardPoints: 250,
          maxReferralRewards: 10000,
        },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!verifyAdminAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const updated = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        projectName: body.projectName || undefined,
        tagline: body.tagline || undefined,
        logoUrl: body.logoUrl || undefined,
        twitterUrl: body.twitterUrl || undefined,
        discordUrl: body.discordUrl || undefined,
        telegramUrl: body.telegramUrl || undefined,
        websiteUrl: body.websiteUrl || undefined,
        maintenanceMode: body.maintenanceMode !== undefined ? body.maintenanceMode : undefined,
        questsEnabled: body.questsEnabled !== undefined ? body.questsEnabled : undefined,
        mintEnabled: body.mintEnabled !== undefined ? body.mintEnabled : undefined,
        stakingEnabled: body.stakingEnabled !== undefined ? body.stakingEnabled : undefined,
        referralsEnabled: body.referralsEnabled !== undefined ? body.referralsEnabled : undefined,
        referralRewardPoints: body.referralRewardPoints !== undefined ? Number(body.referralRewardPoints) : undefined,
        maxReferralRewards: body.maxReferralRewards !== undefined ? Number(body.maxReferralRewards) : undefined,
      },
      create: {
        id: "default",
        projectName: body.projectName || "Hype Stonks",
        tagline: body.tagline || "Trade the Hype. Earn Your Position.",
        logoUrl: body.logoUrl || "/logo.svg",
        twitterUrl: body.twitterUrl || "https://x.com/HypeStonks",
        discordUrl: body.discordUrl || "https://discord.gg/hypestonks",
        telegramUrl: body.telegramUrl || "https://t.me/hypestonks",
        websiteUrl: body.websiteUrl || "https://hype-stonks.io",
        maintenanceMode: body.maintenanceMode || false,
        questsEnabled: body.questsEnabled !== undefined ? body.questsEnabled : true,
        mintEnabled: body.mintEnabled || false,
        stakingEnabled: body.stakingEnabled || false,
        referralsEnabled: body.referralsEnabled !== undefined ? body.referralsEnabled : true,
        referralRewardPoints: Number(body.referralRewardPoints) || 250,
        maxReferralRewards: Number(body.maxReferralRewards) || 10000,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}
