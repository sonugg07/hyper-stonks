"use client";

import React, { useEffect, useRef } from "react";

export const CandleChartBg: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Generate initial candlestick mock data
    const candleWidth = 6;
    const spacing = 18;
    const count = Math.ceil(width / spacing) + 5;

    interface Candle {
      x: number;
      open: number;
      close: number;
      high: number;
      low: number;
      isBullish: boolean;
      speed: number;
    }

    const candles: Candle[] = [];
    let currentPrice = height * 0.55;

    for (let i = 0; i < count; i++) {
      const delta = (Math.random() - 0.46) * 24; // Upward bias for stonks
      const open = currentPrice;
      const close = Math.max(height * 0.2, Math.min(height * 0.85, open + delta));
      const high = Math.min(open, close) - Math.random() * 12;
      const low = Math.max(open, close) + Math.random() * 12;
      const isBullish = close < open; // In canvas Y is inverted (lower Y = higher price)

      candles.push({
        x: i * spacing,
        open,
        close,
        high,
        low,
        isBullish,
        speed: 0.15 + Math.random() * 0.1,
      });

      currentPrice = close;
    }

    let offset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      offset += 0.35;
      if (offset >= spacing) {
        offset = 0;
        // Shift candles
        candles.shift();
        const last = candles[candles.length - 1];
        const delta = (Math.random() - 0.46) * 24;
        const open = last ? last.close : height * 0.5;
        const close = Math.max(height * 0.2, Math.min(height * 0.85, open + delta));
        const high = Math.min(open, close) - Math.random() * 12;
        const low = Math.max(open, close) + Math.random() * 12;
        const isBullish = close < open;

        candles.push({
          x: width + spacing,
          open,
          close,
          high,
          low,
          isBullish,
          speed: 0.15,
        });
      }

      // Draw subtle grid lines
      ctx.strokeStyle = "rgba(0, 255, 163, 0.02)";
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Candlesticks
      candles.forEach((c, index) => {
        const x = index * spacing - offset;
        const color = c.isBullish ? "rgba(0, 255, 163, 0.09)" : "rgba(255, 59, 105, 0.06)";
        const wickColor = c.isBullish ? "rgba(0, 255, 163, 0.12)" : "rgba(255, 59, 105, 0.08)";

        // Wick
        ctx.strokeStyle = wickColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, c.high);
        ctx.lineTo(x, c.low);
        ctx.stroke();

        // Body
        ctx.fillStyle = color;
        const top = Math.min(c.open, c.close);
        const bodyHeight = Math.max(2, Math.abs(c.open - c.close));
        ctx.fillRect(x - candleWidth / 2, top, candleWidth, bodyHeight);
      });

      // Subtle Trendline Glowing Curve
      ctx.beginPath();
      ctx.strokeStyle = "rgba(0, 255, 163, 0.15)";
      ctx.lineWidth = 2;
      ctx.shadowColor = "rgba(0, 255, 163, 0.3)";
      ctx.shadowBlur = 10;

      candles.forEach((c, index) => {
        const x = index * spacing - offset;
        const y = (c.open + c.close) / 2;
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
};
