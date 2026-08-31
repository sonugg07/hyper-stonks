"use client";

import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, RefreshCw, Lock } from "lucide-react";

interface CaptchaVerificationProps {
  onVerify: (verified: boolean, token?: string) => void;
  isVerified: boolean;
}

export const CaptchaVerification: React.FC<CaptchaVerificationProps> = ({
  onVerify,
  isVerified,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY;

  const handleSimulatedVerify = () => {
    if (isVerified) return;
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      onVerify(true, "hcap_verified_" + Date.now());
    }, 900);
  };

  return (
    <div className="p-5 rounded-2xl bg-[#0B130E]/90 border border-stonks-green/20 backdrop-blur-xl shadow-glass">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div
            onClick={handleSimulatedVerify}
            className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all duration-300 ${
              isVerified
                ? "bg-stonks-green border-stonks-green text-black shadow-[0_0_15px_rgba(0,255,163,0.6)]"
                : isVerifying
                ? "border-stonks-cyan bg-stonks-cyan/10"
                : "border-muted-dark hover:border-stonks-green bg-surface-subtle"
            }`}
          >
            {isVerified ? (
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            ) : isVerifying ? (
              <RefreshCw className="w-4 h-4 text-stonks-cyan animate-spin" />
            ) : null}
          </div>

          <div>
            <div
              onClick={handleSimulatedVerify}
              className="text-sm font-bold text-white cursor-pointer select-none flex items-center gap-2 hover:text-stonks-green transition-colors"
            >
              <span>I am a human (Sybil Resistance)</span>
              {isVerified && (
                <span className="px-2 py-0.5 text-[10px] bg-stonks-green/15 text-stonks-green rounded-full font-mono font-bold">
                  PASS
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted mt-0.5">
              Anti-bot protection verifying unique Web3 user conviction
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-muted self-end sm:self-center font-mono border-l sm:border-l border-surface-border pl-3">
          <Lock className="w-3.5 h-3.5 text-stonks-green" />
          <span>hCaptcha™ Secure</span>
        </div>
      </div>
    </div>
  );
};
