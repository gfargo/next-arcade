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
  metadataBase: new URL("https://arcade.griffen.codes"),
  openGraph: {
    title: "The Arcade",
    description: "A collection of 38 retro-inspired games with a terminal aesthetic. Play classic games with a nostalgic twist.",
    type: "website",
    url: "/",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "The Arcade - Retro Terminal Games",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Arcade",
    description: "38 retro-inspired games with a terminal aesthetic. Insert coin to play!",
    images: ["/twitter-image.svg"],
  },
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
