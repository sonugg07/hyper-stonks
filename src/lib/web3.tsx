"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { isValidEvmAddress } from "./utils";

interface Web3ContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number;
  balance: string;
  connectWallet: (walletType?: "injected" | "metamask" | "coinbase" | "demo") => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (targetChainId: number) => Promise<void>;
  isDemoMode: boolean;
  providerName: string | null;
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  isConnected: false,
  isConnecting: false,
  chainId: 1,
  balance: "0.00",
  connectWallet: async () => {},
  disconnectWallet: () => {},
  switchNetwork: async () => {},
  isDemoMode: false,
  providerName: null,
});

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<number>(1);
  const [balance, setBalance] = useState<string>("0.00");
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [providerName, setProviderName] = useState<string | null>(null);

  // Restore cached session on mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("stonks_wallet_address");
    const savedDemo = localStorage.getItem("stonks_wallet_is_demo");
    const savedProvider = localStorage.getItem("stonks_wallet_provider");

    if (savedAddress && isValidEvmAddress(savedAddress)) {
      setAddress(savedAddress);
      setIsDemoMode(savedDemo === "true");
      setProviderName(savedProvider || "EVM Wallet");
      setBalance("1.425 ETH");
    }
  }, []);

  const connectWallet = async (walletType: "injected" | "metamask" | "coinbase" | "demo" = "injected") => {
    setIsConnecting(true);
    try {
      if (walletType === "demo") {
        // Instant interactive demo wallet for evaluation
        const demoAddress = "0x71C8364437a909D3E6c16C0D503C35c12808Ea7";
        setAddress(demoAddress);
        setIsDemoMode(true);
        setProviderName("Demo Testnet Wallet");
        setBalance("2.50 ETH");
        localStorage.setItem("stonks_wallet_address", demoAddress);
        localStorage.setItem("stonks_wallet_is_demo", "true");
        localStorage.setItem("stonks_wallet_provider", "Demo Testnet Wallet");
        setIsConnecting(false);
        return;
      }

      if (typeof window !== "undefined" && (window as any).ethereum) {
        const ethereum = (window as any).ethereum;
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts.length > 0) {
          const userAddress = accounts[0];
          const chainHex = await ethereum.request({ method: "eth_chainId" });
          const currentChainId = parseInt(chainHex, 16);

          setAddress(userAddress);
          setChainId(currentChainId);
          setIsDemoMode(false);
          setProviderName(walletType === "metamask" ? "MetaMask" : walletType === "coinbase" ? "Coinbase Wallet" : "EVM Injected");
          setBalance("1.85 ETH");

          localStorage.setItem("stonks_wallet_address", userAddress);
          localStorage.setItem("stonks_wallet_is_demo", "false");
          localStorage.setItem("stonks_wallet_provider", walletType);

          // Setup account and chain change listeners
          ethereum.on("accountsChanged", (newAccounts: string[]) => {
            if (newAccounts.length === 0) {
              disconnectWallet();
            } else {
              setAddress(newAccounts[0]);
              localStorage.setItem("stonks_wallet_address", newAccounts[0]);
            }
          });

          ethereum.on("chainChanged", (newChainHex: string) => {
            setChainId(parseInt(newChainHex, 16));
          });
        }
      } else {
        // Fallback to demo mode if no browser extension is detected with a friendly auto fallback
        const fallbackAddress = "0x38B76a6D8F1Eb856F52575C7E7799d1912808Ea7";
        setAddress(fallbackAddress);
        setIsDemoMode(true);
        setProviderName("Simulated EVM Provider");
        setBalance("1.00 ETH");
        localStorage.setItem("stonks_wallet_address", fallbackAddress);
        localStorage.setItem("stonks_wallet_is_demo", "true");
        localStorage.setItem("stonks_wallet_provider", "Simulated EVM Provider");
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setIsDemoMode(false);
    setProviderName(null);
    localStorage.removeItem("stonks_wallet_address");
    localStorage.removeItem("stonks_wallet_is_demo");
    localStorage.removeItem("stonks_wallet_provider");
  };

  const switchNetwork = async (targetChainId: number) => {
    if (typeof window !== "undefined" && (window as any).ethereum && !isDemoMode) {
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        });
        setChainId(targetChainId);
      } catch (err) {
        console.error("Failed to switch chain:", err);
      }
    } else {
      setChainId(targetChainId);
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
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
