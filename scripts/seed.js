const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting HYPE STONKS database seeding...');

  // 1. Site Settings (Default config: Mint OFF, Staking OFF, Quests ON, Referrals ON, Maintenance OFF)
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
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
      mintEnabled: false,      // Must initially be OFF
      stakingEnabled: false,   // Must initially be OFF
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
      maxSupply: 3333,
      mintedCount: 1420,
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

  // 4. Default Quests (01-06)
  const defaultQuests = [
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
      description: 'Join the Hype Stonks Discord server and verify your Discord handle to unlock exclusive quest channels.',
      taskType: 'DISCORD',
      url: 'https://discord.gg/hypestonks',
      points: 200,
      verificationType: 'HANDLE',
      isActive: true,
    },
  ];

  for (const q of defaultQuests) {
    await prisma.quest.upsert({
      where: { slug: q.slug },
      update: q,
      create: q,
    });
  }

  // 5. Seed Top Leaderboard Demo Users for rich display
  const demoUsers = [
    {
      walletAddress: '0x71C...82E4',
      xHandle: 'SatoshiStonks',
      totalPoints: 12450,
      referralCode: 'STONK001',
      role: 'USER',
    },
    {
      walletAddress: '0x32B...9F11',
      xHandle: 'GigaChadTrader',
      totalPoints: 9800,
      referralCode: 'CHAD777',
      role: 'USER',
    },
    {
      walletAddress: '0x94A...4C70',
      xHandle: 'BullishWhale',
      totalPoints: 8650,
      referralCode: 'WHALE88',
      role: 'USER',
    },
    {
      walletAddress: '0x18F...77D2',
      xHandle: 'AlphaHunterX',
      totalPoints: 7200,
      referralCode: 'ALPHA22',
      role: 'USER',
    },
    {
      walletAddress: '0x5C9...3A19',
      xHandle: 'DeFiRunner',
      totalPoints: 6150,
      referralCode: 'DEFI999',
      role: 'USER',
    },
    {
      walletAddress: '0x88D...0E55',
      xHandle: 'CryptoVoyager',
      totalPoints: 5400,
      referralCode: 'VOYAGE1',
      role: 'USER',
    },
    {
      walletAddress: '0x21E...88B4',
      xHandle: 'MintMaster_Eth',
      totalPoints: 4950,
      referralCode: 'MINT888',
      role: 'USER',
    },
  ];

  for (const u of demoUsers) {
    await prisma.user.upsert({
      where: { walletAddress: u.walletAddress },
      update: { totalPoints: u.totalPoints },
      create: u,
    });
  }

  // 6. Admin User
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: 'admin123', // Demo login password
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
