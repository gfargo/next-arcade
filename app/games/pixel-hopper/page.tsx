"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const PixelHopperGame = dynamic(() => import("./PixelHopperGame"), { ssr: false })

export default function PixelHopperPage() {
  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
      <div className="terminal-container flex-1 border border-green-500 rounded-md p-4 relative">
        <div className="scanline absolute top-0 left-0 w-full h-full pointer-events-none"></div>

        <div className="terminal-header flex items-center justify-between mb-4 border-b border-green-500 pb-2">
          <Link href="/" className="flex items-center gap-2 hover:text-green-400">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Arcade</span>
          </Link>
          <div className="text-xs">games.griffen.codes | Pixel Hopper v1.3</div>
        </div>

        <PixelHopperGame />
      </div>

      <div className="mt-4 text-xs text-center text-green-700">
        <p>Press Spacebar to jump over the obstacles.</p>
      </div>
    </div>
  )
}

