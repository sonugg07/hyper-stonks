# 📈 HYPE STONKS

> **Trade the Hype. Earn Your Position.**
> A modern community-powered Web3 engagement and gamified quest platform built for high conviction crypto ecosystems.

---

## 🚀 Features

- **Dark Trading Dashboard UX**: Deep obsidian/emerald surfaces (`#060B09`, `#0B130E`) with neon mint (`#00FFA3`), neon cyan (`#00E5FF`), and red candle accents.
- **Dynamic Candlestick Background**: Canvas-based real-time animated candlestick chart with flowing price trajectories and trading grids.
- **Quest & Engagement Flow**:
  - `01`: Follow on X (Live handle verification)
  - `02`: Like & Repost Official Announcement (1-click verification)
  - `03`: Drop a Comment (Proof submission)
  - `04`: EVM Wallet Address Verification (0x validation & autofill)
  - Sybil resistance anti-bot verification
  - Dynamic points attribution & instant verified receipt generation
- **NFT Mint Engine**:
  - Dynamically controlled via Admin Panel (Starts `CLOSED` by default)
  - Generative ERC-721 preview, remaining supply counter, quantity selector, and live Web3 mint flow.
- **Staking Yield Vault**:
  - Dynamically controlled via Admin Panel (Starts `CLOSED` by default)
  - APY yield calculations, lock duration tiers, Stake / Unstake / Claim reward actions.
- **EVM Web3 Connectivity**:
  - Supports MetaMask, Coinbase Wallet, Injected EVM providers, and an **Instant 1-Click Demo Mode** for sandbox evaluations.
- **Secure Admin Panel (`/admin`)**:
  - Protected admin portal with session authentication.
  - Master live switches for **Mint** and **Staking** modules.
  - Quests CRUD (Add, Edit, Reorder, Points modifier).
  - Users directory (Points editor, ban/unban moderation).
  - Submissions review queue (1-click Approve with auto-points award).
  - Protocol branding, social links, and maintenance flags.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/), Canvas, [Canvas Confetti](https://github.com/catdad/canvas-confetti)
- **Database & ORM**: [Prisma](https://www.prisma.io/) with SQLite (local zero-config) / PostgreSQL / Supabase adapter
- **Web3**: EVM connector with Viem & Injected EIP-1193 providers
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📦 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/sonugg07/hyper-stonks.git
cd hyper-stonks
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Initialize Database & Seed
```bash
npx prisma generate
npx prisma db push
node scripts/seed.js
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Admin Access

- **Route**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Default Username**: `admin`
- **Default Password**: `admin123`

---

## 📄 License
MIT License
