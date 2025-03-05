"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

const words = [
  "terminal",
  "arcade",
  "blurry",
  "vision",
  "react",
  "nextjs",
  "typescript",
  "javascript",
  "coding",
  "gaming",
  "challenge",
  "perception",
  "speed",
  "typing",
  "filter",
  "sharpness",
]

export default function BlurryVision() {
  const [currentWord, setCurrentWord] = useState("")
  const [input, setInput] = useState("")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [gameActive, setGameActive] = useState(false)
  const [blurAmount, setBlurAmount] = useState(10)
  const [highScore, setHighScore] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedHighScore = localStorage.getItem("blurryVisionHighScore")
    if (storedHighScore) {
      setHighScore(Number.parseInt(storedHighScore, 10))
    }
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const startGame = useCallback(() => {
    setGameActive(true)
    setScore(0)
    setTimeLeft(10)
    setBlurAmount(10)
    setCurrentWord(words[Math.floor(Math.random() * words.length)])
  }, [])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 0.1))
        setBlurAmount((prev) => Math.max(0, prev - 0.1))
      }, 100)
    } else if (timeLeft <= 0) {
      setGameActive(false)
      if (score > highScore) {
        setHighScore(score)
        localStorage.setItem("blurryVisionHighScore", score.toString())
      }
    }
    return () => clearInterval(timer)
  }, [gameActive, timeLeft, score, highScore])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    if (e.target.value.toLowerCase() === currentWord.toLowerCase()) {
      const pointsEarned = Math.ceil((10 - blurAmount) * 10)
      setScore((prev) => prev + pointsEarned)
      setInput("")
      setCurrentWord(words[Math.floor(Math.random() * words.length)])
      setBlurAmount(10)
      setTimeLeft(10)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Blurry Vision...</p>
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
          <div className="text-xs">games.griffen.codes | Blurry Vision v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <h1 className="text-2xl font-bold mb-2">Blurry Vision</h1>
            <p className="text-sm mb-4">Type the word before it becomes clear for max points!</p>
            <div className="mb-4">
              <p>Score: {score}</p>
              <p>High Score: {highScore}</p>
              {gameActive && <p>Time: {timeLeft.toFixed(1)}s</p>}
            </div>
          </div>

          {!gameActive ? (
            <div className="text-center">
              <Button
                onClick={startGame}
                className="px-4 py-2 bg-green-500 text-black rounded hover:bg-green-600 transition-colors"
              >
                Start Game
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div
                className="text-4xl mb-4 text-center p-4 bg-green-900 rounded"
                style={{ filter: `blur(${blurAmount}px)` }}
              >
                {currentWord}
              </div>
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                className="w-full p-2 bg-black border-2 border-green-500 text-green-500 rounded"
                placeholder="Type the word here..."
                autoFocus
              />
            </div>
          )}

          {!gameActive && score > 0 && (
            <div className="text-center">
              <p className="mb-2">Game Over! Your score: {score}</p>
              <Button
                onClick={startGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Play Again
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-center text-green-700">
        <p>Type the blurry word as fast as you can. The blurrier it is, the more points you get!</p>
      </div>
    </div>
  )
}

