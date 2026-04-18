import type { Metadata } from "next";
import { Bungee, DM_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/providers/web3-provider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const bungee = Bungee({
  variable: "--font-bungee",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DSCoin Protocol Demo",
  description:
    "Minimal Next.js demo for an overcollateralized stablecoin protocol with collateral flows, combined actions, and liquidation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${dmSans.variable} ${bungee.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
