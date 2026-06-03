import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "DSC Material Dashboard",
  description: "Material-style interface for the local DSC protocol demo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <Providers> {children}</Providers>
      </body>
    </html>
  );
}
