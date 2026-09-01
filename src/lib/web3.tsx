"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { isValidEvmAddress } from "./utils";
import { SUPPORTED_CHAINS, getChainName } from "./contracts";

interface Web3ContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number;
  balance: string;
  connectWallet: (walletType?: "injected" | "metamask" | "coinbase" | "demo") => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (targetChainId: number) => Promise<boolean>;
  isDemoMode: boolean;
  providerName: string | null;
  error: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  isConnected: false,
  isConnecting: false,
  chainId: 1,
  balance: "0.00",
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchNetwork: async () => false,
  isDemoMode: false,
  providerName: null,
  error: null,
});

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number>(1);
  const [balance, setBalance] = useState<string>("0.00");
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [providerName, setProviderName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper to fetch live on-chain balance
  const updateBalance = async (addr: string) => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const balHex = await (window as any).ethereum.request({
          method: "eth_getBalance",
          params: [addr, "latest"],
        });
        const balWei = BigInt(balHex);
        const ethVal = (Number(balWei) / 1e18).toFixed(4);
        setBalance(`${ethVal} ETH`);
      } catch {
        setBalance("1.00 ETH");
      }
    }
  };

  // Restore cached session on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("stonks_wallet_address");
    const savedDemo = localStorage.getItem("stonks_wallet_is_demo");
    const savedProvider = localStorage.getItem("stonks_wallet_provider");
    const savedChain = localStorage.getItem("stonks_wallet_chain_id");

    if (savedAddress && isValidEvmAddress(savedAddress)) {
      setAddress(savedAddress);
      setIsDemoMode(savedDemo === "true");
      setProviderName(savedProvider || "EVM Wallet");
      if (savedChain) setChainId(parseInt(savedChain, 10));

      if (savedDemo !== "true" && typeof window !== "undefined" && (window as any).ethereum) {
        updateBalance(savedAddress);
      } else {
        setBalance("2.50 ETH");
      }
    }
  }, []);

  const connectWallet = async (walletType: "injected" | "metamask" | "coinbase" | "demo" = "injected") => {
    setIsConnecting(true);
    setError(null);

    try {
      if (walletType === "demo") {
        // Explicitly requested Instant Demo Mode
        const demoAddress = "0x71C8364437a909D3E6c16C0D503C35c12808Ea7";
        setAddress(demoAddress);
        setIsDemoMode(true);
        setProviderName("Instant Demo Mode");
        setBalance("2.50 ETH");
        setChainId(1);
        localStorage.setItem("stonks_wallet_address", demoAddress);
        localStorage.setItem("stonks_wallet_is_demo", "true");
        localStorage.setItem("stonks_wallet_provider", "Instant Demo Mode");
        localStorage.setItem("stonks_wallet_chain_id", "1");
        return;
      }

      // Check for real injected EVM provider
      if (typeof window === "undefined" || !(window as any).ethereum) {
        throw new Error(
          `No Web3 wallet extension found. Please install ${
            walletType === "metamask" ? "MetaMask" : walletType === "coinbase" ? "Coinbase Wallet" : "an EVM wallet extension"
          } or use Instant Demo Mode.`
        );
      }

      let ethereum = (window as any).ethereum;

      // Provider resolution for multi-wallet extensions
      if (ethereum.providers && Array.isArray(ethereum.providers)) {
        if (walletType === "metamask") {
          ethereum = ethereum.providers.find((p: any) => p.isMetaMask && !p.isBraveWallet) || ethereum.providers[0];
        } else if (walletType === "coinbase") {
          ethereum = ethereum.providers.find((p: any) => p.isCoinbaseWallet) || ethereum.providers[0];
        }
      }

      // Request real account authorization popup from the browser wallet
      const accounts: string[] = await ethereum.request({ method: "eth_requestAccounts" });

      if (!accounts || accounts.length === 0) {
        throw new Error("Wallet connection rejected: No accounts authorized.");
      }

      const userAddress = accounts[0];
      const chainHex = await ethereum.request({ method: "eth_chainId" });
      const currentChainId = parseInt(chainHex, 16);

      setAddress(userAddress);
      setChainId(currentChainId);
      setIsDemoMode(false);
      setProviderName(
        walletType === "metamask" ? "MetaMask" : walletType === "coinbase" ? "Coinbase Wallet" : "EVM Injected"
      );

      localStorage.setItem("stonks_wallet_address", userAddress);
      localStorage.setItem("stonks_wallet_is_demo", "false");
      localStorage.setItem("stonks_wallet_provider", walletType);
      localStorage.setItem("stonks_wallet_chain_id", currentChainId.toString());

      await updateBalance(userAddress);

      // Listen for account changes
      ethereum.on("accountsChanged", (newAccounts: string[]) => {
        if (!newAccounts || newAccounts.length === 0) {
          disconnectWallet();
        } else {
          setAddress(newAccounts[0]);
          localStorage.setItem("stonks_wallet_address", newAccounts[0]);
          updateBalance(newAccounts[0]);
        }
      });

      // Listen for network changes
      ethereum.on("chainChanged", (newChainHex: string) => {
        const newChain = parseInt(newChainHex, 16);
        setChainId(newChain);
        localStorage.setItem("stonks_wallet_chain_id", newChain.toString());
      });
    } catch (err: any) {
      console.error("Wallet connection error:", err);
      const msg = err?.message || "Failed to connect wallet.";
      setError(msg);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setIsDemoMode(false);
    setProviderName(null);
    setError(null);
    localStorage.removeItem("stonks_wallet_address");
    localStorage.removeItem("stonks_wallet_is_demo");
    localStorage.removeItem("stonks_wallet_provider");
    localStorage.removeItem("stonks_wallet_chain_id");
  };

  const switchNetwork = async (targetChainId: number): Promise<boolean> => {
    if (typeof window !== "undefined" && (window as any).ethereum && !isDemoMode) {
      const ethereum = (window as any).ethereum;
      const targetChainHex = `0x${targetChainId.toString(16)}`;

      try {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetChainHex }],
        });
        setChainId(targetChainId);
        return true;
      } catch (switchError: any) {
        // 4902 = chain not added to wallet yet
        if (switchError.code === 4902) {
          const chainCfg = SUPPORTED_CHAINS[targetChainId];
          if (chainCfg) {
            try {
              await ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: targetChainHex,
                    chainName: chainCfg.name,
                    nativeCurrency: chainCfg.nativeCurrency,
                    rpcUrls: chainCfg.rpcUrls,
                    blockExplorerUrls: [chainCfg.blockExplorer],
                  },
                ],
              });
              setChainId(targetChainId);
              return true;
            } catch (addError) {
              console.error("Failed to add network to wallet:", addError);
              return false;
            }
          }
        }
        console.error("Failed to switch network:", switchError);
        return false;
      }
    } else {
      setChainId(targetChainId);
      return true;
    }
  };

  return (
    <Web3Context.Provider
      value={{
        address,
        isConnected: !!address,
        isConnecting,
        chainId,
        balance,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        isDemoMode,
        providerName,
        error,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
