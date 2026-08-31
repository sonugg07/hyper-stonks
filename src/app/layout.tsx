import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/lib/web3";

export const metadata: Metadata = {
  title: "Hype Stonks | Trade the Hype. Earn Your Position.",
  description: "A community-powered Web3 platform where activity, participation and conviction turn into rewards, whitelist allocations, and token staking.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground min-h-screen flex flex-col antialiased selection:bg-stonks-green selection:text-black">
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}
