"use client";

import React from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { CandleChartBg } from "./CandleChartBg";
import { TradingTicker } from "./TradingTicker";

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden">
      <CandleChartBg />
      <Navbar />

      <main className="flex-1 pt-24 pb-16 relative z-10">
        {children}
      </main>

      <div className="relative z-20">
        <TradingTicker />
        <Footer />
      </div>
    </div>
  );
};
