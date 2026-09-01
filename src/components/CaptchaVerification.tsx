"use client";

import React, { useState } from "react";
import { Check, Loader2, ShieldCheck } from "lucide-react";

interface CaptchaVerificationProps {
  onVerify: (verified: boolean, token?: string) => void;
  isVerified: boolean;
}

export const CaptchaVerification: React.FC<CaptchaVerificationProps> = ({
  onVerify,
  isVerified,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    if (isVerified || isVerifying) return;
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      onVerify(true, "verified_human_" + Date.now());
    }, 750);
  };

  return (
    <div
      onClick={handleVerify}
      className={`p-4 sm:p-5 rounded-2xl bg-[#09110C] border transition-all duration-300 shadow-glass cursor-pointer select-none ${
        isVerified
          ? "border-stonks-green/40 shadow-[0_0_25px_rgba(0,255,163,0.15)]"
          : "border-surface-border hover:border-stonks-green/30"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Checkbox & Label */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-7 h-7 rounded-md border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${
              isVerified
                ? "bg-stonks-green border-stonks-green text-black shadow-[0_0_12px_rgba(0,255,163,0.8)]"
                : isVerifying
                ? "border-stonks-green/60 bg-stonks-green/10"
                : "border-muted/50 bg-[#070D0A] hover:border-stonks-green"
            }`}
          >
            {isVerified ? (
              <Check className="w-5 h-5 stroke-[3] text-black" />
            ) : isVerifying ? (
              <Loader2 className="w-4 h-4 text-stonks-green animate-spin" />
            ) : null}
          </div>

          <div>
            <div className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>I'm not a robot</span>
              {isVerified && (
                <span className="text-xs text-stonks-green font-mono font-bold">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted font-mono mt-0.5">
              {isVerified
                ? "Human verification successful"
                : "Click checkbox to verify human presence"}
            </p>
          </div>
        </div>

        {/* Right: Anti-Bot Badge (reCAPTCHA style) */}
        <div className="flex flex-col items-center justify-center shrink-0 pl-3 border-l border-surface-border/80 text-right">
          <div className="flex items-center gap-1 text-stonks-green mb-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold text-white font-mono leading-none">
            reCAPTCHA
          </span>
          <span className="text-[8px] text-muted font-mono mt-0.5 leading-none">
            Privacy - Terms
          </span>
        </div>
      </div>
    </div>
  );
};
