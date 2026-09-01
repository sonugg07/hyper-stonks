/**
 * Web3 Smart Contract Configurations, ABIs, and Chain Explorer Helpers
 */

export interface ChainConfig {
  id: number;
  name: string;
  network: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorer: string;
}

export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  1: {
    id: 1,
    name: "Ethereum Mainnet",
    network: "mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://eth.llamarpc.com", "https://rpc.ankr.com/eth"],
    blockExplorer: "https://etherscan.io",
  },
  11155111: {
    id: 11155111,
    name: "Sepolia Testnet",
    network: "sepolia",
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.sepolia.org", "https://rpc2.sepolia.org"],
    blockExplorer: "https://sepolia.etherscan.io",
  },
  42161: {
    id: 42161,
    name: "Arbitrum One",
    network: "arbitrum",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorer: "https://arbiscan.io",
  },
  8453: {
    id: 8453,
    name: "Base Mainnet",
    network: "base",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorer: "https://basescan.org",
  },
  137: {
    id: 137,
    name: "Polygon Mainnet",
    network: "polygon",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorer: "https://polygonscan.com",
  },
  56: {
    id: 56,
    name: "BNB Smart Chain",
    network: "bsc",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: ["https://bsc-dataseed.binance.org"],
    blockExplorer: "https://bscscan.com",
  },
};

/**
 * Standard ERC-721 / ERC-721A Public Mint ABI
 */
export const ERC721_MINT_ABI = [
  // mint(uint256 quantity)
  {
    name: "mint",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "quantity", type: "uint256" }],
    outputs: [],
  },
  // publicMint(uint256 quantity)
  {
    name: "publicMint",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "quantity", type: "uint256" }],
    outputs: [],
  },
  // mintTo(address recipient, uint256 quantity)
  {
    name: "mintTo",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "quantity", type: "uint256" },
    ],
    outputs: [],
  },
  // totalSupply() view returns (uint256)
  {
    name: "totalSupply",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // cost() / price() view returns (uint256)
  {
    name: "cost",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/**
 * Function Selector Hashes (4 bytes keccak256):
 * mint(uint256): 0xa0712d68
 * publicMint(uint256): 0x40c10f19 (or standard custom)
 * mintTo(address,uint256): 0xa43ab986
 */
export function encodeMintFunctionCall(quantity: number, recipient?: string): string {
  const qtyHex = BigInt(quantity).toString(16).padStart(64, "0");
  if (recipient && recipient.startsWith("0x")) {
    const cleanAddr = recipient.replace(/^0x/, "").toLowerCase().padStart(64, "0");
    // mintTo(address,uint256): 0xa43ab986
    return `0xa43ab986${cleanAddr}${qtyHex}`;
  }
  // mint(uint256): 0xa0712d68
  return `0xa0712d68${qtyHex}`;
}

/**
 * Returns block explorer transaction link
 */
export function getExplorerTxUrl(txHash: string, chainId: number = 1): string {
  const chain = SUPPORTED_CHAINS[chainId] || SUPPORTED_CHAINS[1];
  return `${chain.blockExplorer}/tx/${txHash}`;
}

/**
 * Returns block explorer address/contract link
 */
export function getExplorerAddressUrl(address: string, chainId: number = 1): string {
  const chain = SUPPORTED_CHAINS[chainId] || SUPPORTED_CHAINS[1];
  return `${chain.blockExplorer}/address/${address}`;
}

/**
 * Returns the human-readable network name
 */
export function getChainName(chainId: number): string {
  return SUPPORTED_CHAINS[chainId]?.name || `Chain ID ${chainId}`;
}
