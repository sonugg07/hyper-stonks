import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = "md", showTagline = false }) => {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link href="/" className="flex items-center gap-3 group select-none">
      {/* Animated Candlestick Icon */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center`}>
        <div className="absolute inset-0 bg-stonks-green/20 rounded-lg blur-sm group-hover:bg-stonks-green/30 transition-all" />
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full text-stonks-green transform group-hover:scale-105 transition-transform"
        >
          <rect x="2" y="2" width="28" height="28" rx="6" fill="#0B130E" stroke="#00FFA3" strokeWidth="1.5" strokeOpacity="0.4" />
          {/* Bearish candle */}
          <line x1="8" y1="12" x2="8" y2="22" stroke="#FF3B69" strokeWidth="1" strokeLinecap="round" />
          <rect x="6.5" y="14" width="3" height="6" rx="0.5" fill="#FF3B69" />
          {/* Bullish candle 1 */}
          <line x1="15" y1="8" x2="15" y2="24" stroke="#00FFA3" strokeWidth="1" strokeLinecap="round" />
          <rect x="13.5" y="10" width="3" height="10" rx="0.5" fill="#00FFA3" />
          {/* Breakout Bullish candle 2 */}
          <line x1="22" y1="6" x2="22" y2="20" stroke="#00E5FF" strokeWidth="1" strokeLinecap="round" />
          <rect x="20.5" y="7" width="3" height="8" rx="0.5" fill="#00E5FF" />
          {/* Neon Stonks Uptrend Line */}
          <path
            d="M5 24L13 14L19 17L27 7"
            stroke="#00FFA3"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_6px_rgba(0,255,163,0.8)]"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 font-black tracking-wider">
          <span className={`${textSizes[size]} text-white font-extrabold`}>HYPE</span>
          <span className={`${textSizes[size]} text-stonks-green font-black drop-shadow-[0_0_12px_rgba(0,255,163,0.5)]`}>STONKS</span>
        </div>
        {showTagline && (
          <span className="text-[10px] uppercase tracking-widest text-muted font-semibold">Trade the Hype</span>
        )}
      </div>
    </Link>
  );
};
