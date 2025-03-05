import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import type React from "react";
import "./globals.css";

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Arcade",
  description:
    "A showcase of retro terminal-style games for the web built on Next and React.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${spaceMono.className}  antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
