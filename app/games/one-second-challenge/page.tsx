"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw, Play, Square } from "lucide-react"

export default function OneSecondChallenge() {
  const [gameState, setGameState] = useState<"idle" | "running" | "stopped">("idle")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [initialTime, setInitialTime] = useState<number>(0)
  const [remainingTime, setRemainingTime] = useState<number | null>(null)
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const startGame = () => {
    const newInitialTime = Math.floor(Math.random() * 11) + 5 // Random number between 5-15
    setInitialTime(newInitialTime)
    setGameState("running")
    setStartTime(Date.now())
    setRemainingTime(newInitialTime)
  }

  const stopGame = () => {
    if (gameState === "running") {
      setGameState("stopped")
      const endTime = Date.now()
      const timeElapsed = (endTime - startTime!) / 1000
      const finalTime = Math.max(0, initialTime - timeElapsed)
      setRemainingTime(finalTime)

      if (bestScore === null || Math.abs(finalTime) < Math.abs(bestScore)) {
        setBestScore(finalTime)
      }
    }
  }

  const resetGame = () => {
    setGameState("idle")
    setStartTime(null)
    setRemainingTime(null)
  }

  useEffect(() => {
    if (gameState === "running") {
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime!) / 1000
        const remaining = Math.max(0, initialTime - elapsed)
        setRemainingTime(remaining)
        if (remaining <= 0) {
          stopGame()
        }
      }, 10)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [gameState, startTime, initialTime]) // Removed stopGame from dependencies

  const getTimerColor = () => {
    if (remainingTime === null) return "text-green-500"
    if (remainingTime <= 0.1) return "text-green-500"
    if (remainingTime <= 0.3) return "text-yellow-500"
    return "text-red-500"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading One-Second Challenge...</p>
              <div className="inline-block w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
      <div className="terminal-container flex-1 border border-green-500 rounded-md p-4 relative">
        <div className="scanline absolute top-0 left-0 w-full h-full pointer-events-none"></div>

        <div className="terminal-header flex items-center justify-between mb-4 border-b border-green-500 pb-2">
          <Link href="/" className="flex items-center gap-2 hover:text-green-400">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Arcade</span>
          </Link>
          <div className="text-xs">games.griffen.codes | One-Second Challenge v2.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <h1 className="text-2xl mb-2">One-Second Challenge</h1>
            <p className="text-sm">Stop the timer as close to zero as possible!</p>
          </div>

          <div className="timer-display text-center">
            <p className={`text-4xl font-bold ${getTimerColor()}`} aria-live="polite">
              {remainingTime !== null ? remainingTime.toFixed(3) : "0.000"}
            </p>
            <p className="text-sm mt-2">
              {gameState === "stopped" && remainingTime !== null ? `${remainingTime.toFixed(3)} seconds from zero` : ""}
            </p>
          </div>

          <div className="controls flex justify-center space-x-4">
            {gameState === "idle" && (
              <button
                onClick={startGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30 flex items-center gap-2"
                aria-label="Start game"
              >
                <Play className="h-4 w-4" />
                Start
              </button>
            )}
            {gameState === "running" && (
              <button
                onClick={stopGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30 flex items-center gap-2"
                aria-label="Stop timer"
              >
                <Square className="h-4 w-4" />
                Stop
              </button>
            )}
            {gameState === "stopped" && (
              <button
                onClick={resetGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30 flex items-center gap-2"
                aria-label="Try again"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            )}
          </div>

          {bestScore !== null && (
            <div className="best-score text-center">
              <p className="text-lg">
                Best Score: <span className="font-bold">{bestScore.toFixed(3)}</span>
              </p>
              <p className="text-sm">({Math.abs(bestScore).toFixed(3)} seconds from zero)</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-center text-green-700">
        <p>
          Press Start to begin the countdown from {initialTime || "5-15"} seconds, then try to stop the timer exactly at
          zero. How close can you get?
        </p>
      </div>
    </div>
  )
}

