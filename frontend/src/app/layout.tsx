import type {Metadata} from "next";
import {headers} from "next/headers";
import "./globals.css";

import {Providers} from "./providers";

import "katex/dist/katex.min.css";

export const metadata: Metadata = {
  title: "DSC Material Dashboard",
  description: "Material-style interface for the local DSC protocol demo."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const cookies = headersList.get("cookie");

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Providers cookies={cookies}>{children}</Providers>
      </body>
    </html>
  );
}
