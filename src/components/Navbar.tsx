"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { useWeb3 } from "@/lib/web3";
import { shortenAddress } from "@/lib/utils";
import { WalletModal } from "./WalletModal";
import { SUPPORTED_CHAINS } from "@/lib/contracts";
import {
  Wallet,
  Menu,
  X,
  Copy,
  Check,
  LogOut,
  ChevronDown,
  ClipboardList,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const {
    address,
    isConnected,
    disconnectWallet,
    chainId,
    networkName,
    balance,
    switchNetwork,
  } = useWeb3();
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Waitlist", href: "/waitlist", badge: "HOT" },
    { name: "Mint", href: "/mint" },
    { name: "Staking", href: "/staking" },
  ];

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#060B09]/85 backdrop-blur-xl border-b border-stonks-green/15 shadow-[0_4px_30px_rgba(0,0,0,0.5)] py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Logo size="md" showTagline />

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#0B130E]/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-stonks-green/15">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href === "/waitlist" && pathname === "/quests");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? "text-stonks-green bg-stonks-green/10 font-semibold shadow-[inset_0_0_12px_rgba(0,255,163,0.15)]"
                      : "text-muted hover:text-white hover:bg-surface-subtle"
                  }`}
                >
                  {link.name}
                  {link.badge && (
                    <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-stonks-green text-black uppercase leading-tight">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Network Pill & Wallet Connect */}
          <div className="hidden md:flex items-center gap-3">
            {isConnected && address ? (
              <div className="flex items-center gap-2">
                {/* Network Indicator & Switcher */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-subtle border border-surface-border hover:border-stonks-green/40 text-xs font-mono text-white transition-all cursor-pointer"
                  >
                    <span className="w-2 h-2 rounded-full bg-stonks-green" />
                    <span>{networkName}</span>
                    <ChevronDown className="w-3 h-3 text-muted" />
                  </button>

                  {isNetworkDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsNetworkDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-[#0B130E] border border-stonks-green/20 rounded-xl p-1.5 shadow-2xl z-20 space-y-1">
                        <div className="px-2.5 py-1 text-[10px] font-mono text-muted uppercase">
                          Select EVM Network
                        </div>
                        {Object.values(SUPPORTED_CHAINS).map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              switchNetwork(c.id);
                              setIsNetworkDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors text-left cursor-pointer ${
                              chainId === c.id
                                ? "bg-stonks-green/15 text-stonks-green font-bold"
                                : "text-muted hover:text-white hover:bg-surface-subtle"
                            }`}
                          >
                            <span>{c.name}</span>
                            {chainId === c.id && <span className="text-[10px]">✓</span>}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* User Address Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-surface-subtle border border-stonks-green/30 hover:border-stonks-green/60 text-white transition-all shadow-sm group cursor-pointer"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-stonks-green animate-pulse" />
                    <span className="text-xs font-mono font-bold text-stonks-green">
                      {shortenAddress(address)}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted group-hover:text-white transition-transform" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-[#0B130E] border border-stonks-green/20 rounded-xl p-2 shadow-2xl z-20 space-y-1">
                        <div className="px-3 py-2 border-b border-surface-border">
                          <div className="text-[10px] text-muted uppercase font-semibold">
                            Connected Wallet
                          </div>
                          <div className="font-mono text-xs text-white truncate font-medium">
                            {address}
                          </div>
                          <div className="font-mono text-[11px] text-stonks-green mt-1">
                            Balance: {balance}
                          </div>
                        </div>

                        <button
                          onClick={handleCopyAddress}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted hover:text-white hover:bg-surface-subtle rounded-lg transition-colors text-left cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-stonks-green" />
                              <span className="text-stonks-green font-medium">Copied Address!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy EVM Address</span>
                            </>
                          )}
                        </button>

                        <Link
                          href="/waitlist"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted hover:text-white hover:bg-surface-subtle rounded-lg transition-colors text-left"
                        >
                          <ClipboardList className="w-4 h-4 text-stonks-green" />
                          <span>Waitlist Entry</span>
                        </Link>

                        <button
                          onClick={() => {
                            disconnectWallet();
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stonks-red hover:bg-stonks-red/10 rounded-lg transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Disconnect Wallet</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsWalletModalOpen(true)}
                className="relative group px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-stonks-green hover:bg-stonks-green-dim transition-all shadow-[0_0_20px_rgba(0,255,163,0.35)] hover:shadow-[0_0_30px_rgba(0,255,163,0.6)] flex items-center gap-2 cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 md:hidden">
            {isConnected && address && (
              <span className="text-xs font-mono font-bold text-stonks-green bg-surface-subtle px-2.5 py-1.5 rounded-lg border border-stonks-green/20">
                {shortenAddress(address, 2)}
              </span>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-muted hover:text-white bg-surface-subtle border border-surface-border cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#0B130E]/95 backdrop-blur-2xl border-b border-stonks-green/20 px-6 py-6 space-y-4 shadow-2xl">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href === "/waitlist" && pathname === "/quests");
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-base font-semibold transition-colors flex items-center justify-between ${
                      isActive
                        ? "text-stonks-green bg-stonks-green/10 border border-stonks-green/30"
                        : "text-muted hover:text-white hover:bg-surface-subtle"
                    }`}
                  >
                    <span>{link.name}</span>
                    {link.badge && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-stonks-green text-black uppercase">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-surface-border">
              {isConnected && address ? (
                <div className="space-y-3">
                  <div className="p-3 bg-surface-subtle rounded-xl border border-surface-border text-xs text-muted flex items-center justify-between">
                    <span className="font-mono text-white">{shortenAddress(address)} ({networkName})</span>
                    <button
                      onClick={handleCopyAddress}
                      className="text-stonks-green font-semibold hover:underline cursor-pointer"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 text-center text-sm font-bold text-stonks-red bg-stonks-red/10 border border-stonks-red/20 rounded-xl cursor-pointer"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsWalletModalOpen(true);
                  }}
                  className="w-full py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider text-black bg-stonks-green hover:bg-stonks-green-dim flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,163,0.3)] cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect EVM Wallet</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Wallet Connection Modal */}
      <WalletModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
      />
    </>
  );
};
