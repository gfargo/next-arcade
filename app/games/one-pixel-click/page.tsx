"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

const GRID_SIZE = 10
const INITIAL_PIXEL_SIZE = 10
const MIN_PIXEL_SIZE = 1
const SHRINK_FACTOR = 0.9
const GAME_DURATION = 30

export default function OnePixelClick() {
  const [pixelPosition, setPixelPosition] = useState<[number, number] | null>(null)
  const [pixelSize, setPixelSize] = useState(INITIAL_PIXEL_SIZE)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    const storedHighScore = localStorage.getItem("onePixelClickHighScore")
    if (storedHighScore) {
      setHighScore(Number.parseInt(storedHighScore, 10))
    }
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const startGame = useCallback(() => {
    setGameStarted(true)
    setScore(0)
    setTimeLeft(GAME_DURATION)
    setPixelSize(INITIAL_PIXEL_SIZE)
    setGameOver(false)
    movePixel()
  }, [])

  const movePixel = useCallback(() => {
    const newRow = Math.floor(Math.random() * GRID_SIZE)
    const newCol = Math.floor(Math.random() * GRID_SIZE)
    setPixelPosition([newRow, newCol])
  }, [])

  const handlePixelClick = useCallback(() => {
    if (gameOver) return

    setScore((prevScore) => prevScore + 1)
    const newSize = Math.max(pixelSize * SHRINK_FACTOR, MIN_PIXEL_SIZE)
    setPixelSize(newSize)
    movePixel()

    if (newSize === MIN_PIXEL_SIZE) {
      endGame()
    }
  }, [gameOver, pixelSize, movePixel])

  const endGame = useCallback(() => {
    setGameOver(true)
    setGameStarted(false)
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem("onePixelClickHighScore", score.toString())
    }
  }, [score, highScore])

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer)
            endGame()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [gameStarted, gameOver, endGame])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading One-Pixel Click...</p>
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
          <div className="text-xs">games.griffen.codes | One-Pixel Click v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <h1 className="text-2xl font-bold mb-2">One-Pixel Click</h1>
            <p className="text-sm mb-4">Click the shrinking pixel as many times as you can before time runs out!</p>
            <div className="mb-4">
              <p>Score: {score}</p>
              <p>High Score: {highScore}</p>
              <p>Time Left: {timeLeft}s</p>
            </div>
          </div>

          {!gameStarted && !gameOver && (
            <div className="text-center">
              <Button
                onClick={startGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
              >
                Start Game
              </Button>
            </div>
          )}

          {gameStarted && !gameOver && (
            <div
              className="grid grid-cols-10 gap-1 mb-4 justify-center"
              style={{ width: "300px", height: "300px", margin: "0 auto" }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                const row = Math.floor(index / GRID_SIZE)
                const col = index % GRID_SIZE
                const isPixel = pixelPosition && pixelPosition[0] === row && pixelPosition[1] === col

                return (
                  <div
                    key={index}
                    className={`w-full h-full flex items-center justify-center ${
                      isPixel ? "bg-green-500 cursor-pointer" : "border border-green-900"
                    }`}
                    style={{ width: "30px", height: "30px" }}
                    onClick={isPixel ? handlePixelClick : undefined}
                  >
                    {isPixel && (
                      <div
                        style={{
                          width: `${pixelSize}px`,
                          height: `${pixelSize}px`,
                          backgroundColor: "black",
                        }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {gameOver && (
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
        <p>Click the pixel as fast as you can! The pixel shrinks with each click. How small can you go?</p>
      </div>
    </div>
  )
}

