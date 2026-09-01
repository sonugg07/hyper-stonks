import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { Twitter, Send, Disc, ExternalLink, ShieldCheck, Terminal, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 bg-[#040806] border-t border-stonks-green/15 pt-16 pb-12 overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-stonks-green/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-surface-border">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="lg" showTagline />
            <p className="text-sm text-muted max-w-sm leading-relaxed">
              A community-powered Web3 platform where activity, social engagement, and conviction turn into exclusive waitlist positions, whitelist access, and future token allocations.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://x.com/HypeStonks"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-surface-subtle border border-surface-border hover:border-stonks-green/50 flex items-center justify-center text-muted hover:text-stonks-green transition-all"
                aria-label="X Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://t.me/hypestonks"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-surface-subtle border border-surface-border hover:border-stonks-cyan/50 flex items-center justify-center text-muted hover:text-stonks-cyan transition-all"
                aria-label="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="https://discord.gg/hypestonks"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-surface-subtle border border-surface-border hover:border-indigo-400/50 flex items-center justify-center text-muted hover:text-indigo-400 transition-all"
                aria-label="Discord"
              >
                <Disc className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Ecosystem</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/waitlist" className="hover:text-stonks-green transition-colors">
                  Join Waitlist
                </Link>
              </li>
              <li>
                <Link href="/mint" className="hover:text-stonks-green transition-colors">
                  NFT Mint
                </Link>
              </li>
              <li>
                <Link href="/staking" className="hover:text-stonks-green transition-colors">
                  Token Staking
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-stonks-green transition-colors">
                  Admin Control Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Protocol Status */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">System Status</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-surface-subtle/80 rounded-lg border border-surface-border">
                <span className="text-muted">Waitlist Engine</span>
                <span className="flex items-center gap-1.5 text-stonks-green font-semibold">
                  <span className="w-2 h-2 rounded-full bg-stonks-green animate-pulse" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-subtle/80 rounded-lg border border-surface-border">
                <span className="text-muted">EVM Network</span>
                <span className="text-stonks-cyan font-semibold">Ethereum Mainnet</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-surface-subtle/80 rounded-lg border border-surface-border">
                <span className="text-muted">Security Verification</span>
                <span className="text-white flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-stonks-green" />
                  Anti-Bot Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div>
            © {new Date().getFullYear()} <span className="text-white font-semibold">Hype Stonks Protocol</span>. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/waitlist" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/waitlist" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/admin" className="text-stonks-green/80 hover:text-stonks-green transition-colors flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
