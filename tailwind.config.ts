import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#060B09",
        surface: {
          DEFAULT: "#0B130E",
          subtle: "#0E1A13",
          card: "rgba(13, 23, 17, 0.75)",
          glass: "rgba(15, 28, 20, 0.65)",
          border: "#172A1F",
          "border-light": "#223E2E",
        },
        stonks: {
          green: "#00FFA3",
          "green-dim": "#00CC82",
          "green-glow": "rgba(0, 255, 163, 0.15)",
          cyan: "#00E5FF",
          "cyan-glow": "rgba(0, 229, 255, 0.15)",
          red: "#FF3B69",
          "red-glow": "rgba(255, 59, 105, 0.15)",
          gold: "#FFD700",
          silver: "#C0C0C0",
          bronze: "#CD7F32",
        },
        muted: {
          DEFAULT: "#7E9388",
          foreground: "#9DB2A7",
          dark: "#475C51",
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'trading-grid': 'linear-gradient(to right, rgba(0, 255, 163, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 255, 163, 0.04) 1px, transparent 1px)',
        'hero-glow': 'radial-gradient(circle at 50% 30%, rgba(0, 255, 163, 0.12) 0%, rgba(0, 229, 255, 0.06) 35%, transparent 70%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      boxShadow: {
        'neon-green': '0 0 25px -5px rgba(0, 255, 163, 0.35)',
        'neon-cyan': '0 0 25px -5px rgba(0, 229, 255, 0.35)',
        'neon-red': '0 0 25px -5px rgba(255, 59, 105, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'card-glow': '0 0 0 1px rgba(0, 255, 163, 0.2), 0 8px 24px -4px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'candle-up': 'candleUp 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        candleUp: {
          '0%': { transform: 'scaleY(0.95)' },
          '100%': { transform: 'scaleY(1.05)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
