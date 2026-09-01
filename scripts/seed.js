const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting HYPE STONKS database seeding...');

  // 1. Site Settings (Default config: Mint OFF, Staking OFF, Quests/Waitlist ON, Referrals ON, Maintenance OFF)
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {
      projectName: 'Hype Stonks',
      tagline: 'Trade the Hype. Earn Your Position.',
      twitterUrl: 'https://x.com/HypeStonks',
      discordUrl: 'https://discord.gg/hypestonks',
      telegramUrl: 'https://t.me/hypestonks',
      websiteUrl: 'https://hype-stonks.io',
      questsEnabled: true,
      mintEnabled: false,      // Initially OFF
      stakingEnabled: false,   // Initially OFF
      referralsEnabled: true,
      referralRewardPoints: 250,
    },
    create: {
      id: 'default',
      projectName: 'Hype Stonks',
      tagline: 'Trade the Hype. Earn Your Position.',
      logoUrl: '/logo.svg',
      twitterUrl: 'https://x.com/HypeStonks',
      discordUrl: 'https://discord.gg/hypestonks',
      telegramUrl: 'https://t.me/hypestonks',
      websiteUrl: 'https://hype-stonks.io',
      maintenanceMode: false,
      questsEnabled: true,
      mintEnabled: false,      // Initially OFF
      stakingEnabled: false,   // Initially OFF
      referralsEnabled: true,
      referralRewardPoints: 250,
      maxReferralRewards: 10000,
    },
  });

  // 2. Mint Settings (Default: OFF)
  await prisma.mintSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      isActive: false, // OFF by default
      priceEth: 0.08,
      maxSupply: 2222,
      mintedCount: 0,
      maxPerWallet: 3,
      contractAddress: '0x38B76a6D8F1Eb856F52575C7E7799d1912808Ea7',
      chain: 'Ethereum Mainnet',
      chainId: 1,
    },
  });

  // 3. Staking Settings (Default: OFF)
  await prisma.stakingSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      isActive: false, // OFF by default
      apyPercent: 42.5,
      minStake: 0.1,
      maxStake: 50.0,
      lockDurationDays: 30,
      rewardTokenSymbol: '$STONKS',
      contractAddress: '0x99A87C6F67e0eD40360a0a86B91054E83b4Bf2F1',
      chain: 'Ethereum Mainnet',
      chainId: 1,
      totalStaked: 842.6,
    },
  });

  // 4. Default Waitlist Tasks (01-06)
  const defaultTasks = [
    {
      slug: 'follow-x',
      orderIndex: 1,
      title: 'Follow Hype Stonks on X',
      description: 'Follow the official Hype Stonks account on X, then enter your handle below for verification.',
      taskType: 'FOLLOW_X',
      url: 'https://x.com/HypeStonks',
      points: 250,
      verificationType: 'HANDLE',
      isActive: true,
    },
    {
      slug: 'like-repost-x',
      orderIndex: 2,
      title: 'Like & Repost Official Announcement',
      description: 'Like and repost the pinned launch announcement on X.',
      taskType: 'LIKE_X',
      url: 'https://x.com/HypeStonks/status/1890000000000000000',
      points: 350,
      verificationType: 'AUTO',
      isActive: true,
    },
    {
      slug: 'comment-x',
      orderIndex: 3,
      title: 'Drop a Comment on the Pinned Post',
      description: 'Open the post, leave a bullish comment about Hype Stonks, then paste your comment or reply link.',
      taskType: 'COMMENT_X',
      url: 'https://x.com/HypeStonks/status/1890000000000000000',
      points: 300,
      verificationType: 'LINK',
      isActive: true,
    },
    {
      slug: 'evm-wallet-address',
      orderIndex: 4,
      title: 'Your EVM Wallet Address',
      description: 'Enter any compatible EVM wallet address to receive whitelist allocation & future airdrop distributions.',
      taskType: 'WALLET_CONNECT',
      url: null,
      points: 500,
      verificationType: 'WALLET',
      isActive: true,
    },
    {
      slug: 'join-telegram',
      orderIndex: 5,
      title: 'Join Official Telegram Community',
      description: 'Join the inner alpha Telegram community for real-time announcements, trade alerts, and staking drops.',
      taskType: 'TELEGRAM',
      url: 'https://t.me/hypestonks',
      points: 200,
      verificationType: 'AUTO',
      isActive: true,
    },
    {
      slug: 'join-discord',
      orderIndex: 6,
      title: 'Join Discord Server & Claim Role',
      description: 'Join the Hype Stonks Discord server and verify your Discord handle to unlock exclusive channels.',
      taskType: 'DISCORD',
      url: 'https://discord.gg/hypestonks',
      points: 200,
      verificationType: 'HANDLE',
      isActive: true,
    },
  ];

  for (const t of defaultTasks) {
    await prisma.quest.upsert({
      where: { slug: t.slug },
      update: t,
      create: t,
    });
  }

  // 5. Admin User (Mewtwogg)
  await prisma.adminUser.upsert({
    where: { username: 'Mewtwogg' },
    update: {
      passwordHash: 'Mewtwo@7860',
    },
    create: {
      username: 'Mewtwogg',
      passwordHash: 'Mewtwo@7860',
      role: 'SUPERADMIN',
    },
  });

  // Also keep default admin for backward compatibility if needed
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {
      passwordHash: 'Mewtwo@7860',
    },
    create: {
      username: 'admin',
      passwordHash: 'Mewtwo@7860',
      role: 'SUPERADMIN',
    },
  });

  console.log('✅ HYPE STONKS database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
