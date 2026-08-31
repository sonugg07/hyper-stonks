export type TaskType =
  | "FOLLOW_X"
  | "LIKE_X"
  | "REPOST_X"
  | "COMMENT_X"
  | "WALLET_CONNECT"
  | "VISIT_URL"
  | "DISCORD"
  | "TELEGRAM"
  | "CUSTOM";

export type VerificationType = "HANDLE" | "LINK" | "WALLET" | "AUTO" | "MANUAL";

export type SubmissionStatus = "NOT_STARTED" | "PENDING" | "VERIFIED" | "FAILED" | "APPROVED" | "REJECTED";

export interface Quest {
  id: string;
  slug: string;
  orderIndex: number;
  title: string;
  description: string;
  taskType: TaskType;
  url: string | null;
  points: number;
  verificationType: VerificationType;
  isActive: boolean;
  metadata?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalUsers: number;
  activeQuests: number;
  totalPoints: number;
  rewardsDistributed: string;
  registeredWallets: number;
}

export interface UserProfile {
  id: string;
  walletAddress: string;
  xHandle?: string | null;
  referralCode: string;
  referredBy?: string | null;
  totalPoints: number;
  rank?: number;
  isBanned: boolean;
  role: string;
  createdAt: string;
  completedQuestsCount: number;
  totalQuestsCount: number;
  referralCount: number;
  referralPoints: number;
  stakedAmount: number;
  stakingRewards: number;
  mintedNfts: number;
}

export interface MintConfig {
  isActive: boolean;
  priceEth: number;
  maxSupply: number;
  mintedCount: number;
  maxPerWallet: number;
  contractAddress: string;
  chain: string;
  chainId: number;
  startDate?: string | null;
  endDate?: string | null;
}

export interface StakingConfig {
  isActive: boolean;
  apyPercent: number;
  minStake: number;
  maxStake: number;
  lockDurationDays: number;
  rewardTokenSymbol: string;
  contractAddress: string;
  chain: string;
  chainId: number;
  totalStaked: number;
}

export interface SiteSettingsConfig {
  projectName: string;
  tagline: string;
  logoUrl: string;
  twitterUrl: string;
  discordUrl: string;
  telegramUrl: string;
  websiteUrl: string;
  maintenanceMode: boolean;
  questsEnabled: boolean;
  mintEnabled: boolean;
  stakingEnabled: boolean;
  referralsEnabled: boolean;
  referralRewardPoints: number;
  maxReferralRewards: number;
}
