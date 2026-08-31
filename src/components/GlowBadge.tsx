import React from "react";

interface GlowBadgeProps {
  children: React.ReactNode;
  variant?: "green" | "cyan" | "red" | "gold";
  size?: "sm" | "md";
  className?: string;
}

export const GlowBadge: React.FC<GlowBadgeProps> = ({
  children,
  variant = "green",
  size = "md",
  className = "",
}) => {
  const variantStyles = {
    green: "bg-stonks-green/10 text-stonks-green border-stonks-green/30 shadow-[0_0_12px_rgba(0,255,163,0.2)]",
    cyan: "bg-stonks-cyan/10 text-stonks-cyan border-stonks-cyan/30 shadow-[0_0_12px_rgba(0,229,255,0.2)]",
    red: "bg-stonks-red/10 text-stonks-red border-stonks-red/30 shadow-[0_0_12px_rgba(255,59,105,0.2)]",
    gold: "bg-amber-400/10 text-amber-300 border-amber-400/30 shadow-[0_0_12px_rgba(251,191,36,0.2)]",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};
