/**
 * Web3 Smart Contract Configurations, ABIs, and Chain Explorer Helpers
 */

export const MAX_NFT_SUPPLY = 2222;

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
    rpcUrls: ["https://eth.llamarpc.com", "https://rpc.ankr.com/eth", "https://cloudflare-eth.com"],
    blockExplorer: "https://etherscan.io",
  },
  999: {
    id: 999,
    name: "Hyperliquid EVM",
    network: "hyperliquid",
    nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
    rpcUrls: ["https://rpc.hyperliquid.xyz/evm"],
    blockExplorer: "https://hyperevmscan.io",
  },
  8453: {
    id: 8453,
    name: "Base Mainnet",
    network: "base",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.base.org", "https://base.llamarpc.com"],
    blockExplorer: "https://basescan.org",
  },
  42161: {
    id: 42161,
    name: "Arbitrum One",
    network: "arbitrum",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://arb1.arbitrum.io/rpc", "https://rpc.ankr.com/arbitrum"],
    blockExplorer: "https://arbiscan.io",
  },
  137: {
    id: 137,
    name: "Polygon Mainnet",
    network: "polygon",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://polygon-rpc.com", "https://rpc.ankr.com/polygon"],
    blockExplorer: "https://polygonscan.com",
  },
  56: {
    id: 56,
    name: "BNB Smart Chain",
    network: "bsc",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: ["https://bsc-dataseed.binance.org", "https://rpc.ankr.com/bsc"],
    blockExplorer: "https://bscscan.com",
  },
  11155111: {
    id: 11155111,
    name: "Sepolia Testnet",
    network: "sepolia",
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.sepolia.org", "https://rpc2.sepolia.org", "https://gateway.tenderly.co/public/sepolia"],
    blockExplorer: "https://sepolia.etherscan.io",
  },
  998: {
    id: 998,
    name: "Hyperliquid Testnet",
    network: "hyperliquid-testnet",
    nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
    rpcUrls: ["https://rpc.hyperliquid-testnet.xyz/evm"],
    blockExplorer: "https://testnet.hypurrscan.io",
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
 * publicMint(uint256): 0x40c10f19
 * mintTo(address,uint256): 0xa43ab986
 * totalSupply(): 0x18160ddd
 */
export function encodeMintFunctionCall(quantity: number, recipient?: string): string {
  const qtyHex = BigInt(quantity).toString(16).padStart(64, "0");
  if (recipient && recipient.startsWith("0x")) {
    const cleanAddr = recipient.replace(/^0x/, "").toLowerCase().padStart(64, "0");
    return `0xa43ab986${cleanAddr}${qtyHex}`;
  }
  return `0xa0712d68${qtyHex}`;
}

/**
 * Reads live on-chain totalSupply() from deployed ERC-721 contract via RPC/Provider.
 */
export async function fetchOnChainTotalSupply(
  contractAddress: string,
  chainId: number = 1,
  injectedProvider?: any
): Promise<{ totalSupply: number | null; isAvailable: boolean; error?: string }> {
  if (!contractAddress || !contractAddress.startsWith("0x") || contractAddress.length !== 42) {
    return { totalSupply: null, isAvailable: false, error: "Contract address is not configured." };
  }

  // 1. Try injected provider (e.g. window.ethereum) if provided
  if (injectedProvider && typeof injectedProvider.request === "function") {
    try {
      const resultHex = await injectedProvider.request({
        method: "eth_call",
        params: [
          {
            to: contractAddress,
            data: "0x18160ddd", // totalSupply()
          },
          "latest",
        ],
      });

      if (resultHex && resultHex !== "0x" && resultHex.length >= 66) {
        const supply = Number(BigInt(resultHex));
        if (!isNaN(supply) && supply >= 0) {
          return { totalSupply: Math.min(MAX_NFT_SUPPLY, supply), isAvailable: true };
        }
      }
    } catch {
      // fallback to RPC
    }
  }

  // 2. Query public JSON-RPC nodes
  const chain = SUPPORTED_CHAINS[chainId] || SUPPORTED_CHAINS[1];
  for (const rpcUrl of chain.rpcUrls) {
    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_call",
          params: [
            {
              to: contractAddress,
              data: "0x18160ddd", // totalSupply()
            },
            "latest",
          ],
        }),
      });

      if (!response.ok) continue;
      const json = await response.json();
      if (json.result && json.result !== "0x" && json.result.length >= 66) {
        const supply = Number(BigInt(json.result));
        if (!isNaN(supply) && supply >= 0) {
          return { totalSupply: Math.min(MAX_NFT_SUPPLY, supply), isAvailable: true };
        }
      }
    } catch {
      // try next RPC
    }
  }

  return {
    totalSupply: null,
    isAvailable: false,
    error: `On-chain totalSupply() unavailable for ${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)} on ${chain.name}.`,
  };
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

/**
 * Resolves chain ID from chain name string
 */
export function getChainIdFromName(chainName: string): number {
  const entry = Object.values(SUPPORTED_CHAINS).find(
    (c) => c.name.toLowerCase() === chainName.toLowerCase() || c.network.toLowerCase() === chainName.toLowerCase()
  );
  return entry ? entry.id : 1;
}
