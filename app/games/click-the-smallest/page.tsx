"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

const GRID_SIZE = 5
const INITIAL_BUTTON_SIZE = 50
const MIN_BUTTON_SIZE = 5
const SHRINK_FACTOR = 0.8

export default function ClickTheSmallest() {
  const [buttonSizes, setButtonSizes] = useState<number[][]>(
    Array(GRID_SIZE).fill(Array(GRID_SIZE).fill(INITIAL_BUTTON_SIZE)),
  )
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedHighScore = localStorage.getItem("clickTheSmallestHighScore")
    if (storedHighScore) {
      setHighScore(Number.parseInt(storedHighScore, 10))
    }
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleButtonClick = useCallback(
    (row: number, col: number) => {
      if (gameOver) return

      setButtonSizes((prevSizes) => {
        const newSizes = prevSizes.map((r) => [...r])
        const newSize = Math.max(newSizes[row][col] * SHRINK_FACTOR, MIN_BUTTON_SIZE)
        newSizes[row][col] = newSize

        if (newSize === MIN_BUTTON_SIZE) {
          setGameOver(true)
          const newScore = score + 1
          if (newScore > highScore) {
            setHighScore(newScore)
            localStorage.setItem("clickTheSmallestHighScore", newScore.toString())
          }
        }

        return newSizes
      })

      setScore((prevScore) => prevScore + 1)
    },
    [gameOver, score, highScore],
  )

  const resetGame = useCallback(() => {
    setButtonSizes(Array(GRID_SIZE).fill(Array(GRID_SIZE).fill(INITIAL_BUTTON_SIZE)))
    setScore(0)
    setGameOver(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Click the Smallest...</p>
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
          <div className="text-xs">games.griffen.codes | Click the Smallest v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <h1 className="text-2xl font-bold mb-2">Click the Smallest Button</h1>
            <p className="text-sm mb-4">
              Click on any button. Each click makes the next one smaller. How small can you go?
            </p>
            <div className="mb-4">
              <p>Score: {score}</p>
              <p>High Score: {highScore}</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-4 justify-center">
            {buttonSizes.map((row, rowIndex) =>
              row.map((size, colIndex) => (
                <Button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleButtonClick(rowIndex, colIndex)}
                  style={{ width: `${size}px`, height: `${size}px`, padding: 0, minWidth: "unset" }}
                  className="flex items-center justify-center bg-green-700 hover:bg-green-600 text-black"
                  disabled={gameOver}
                >
                  {size > 20 ? "👆" : ""}
                </Button>
              )),
            )}
          </div>

          {gameOver && (
            <div className="text-center">
              <p className="mb-2">Game Over! Your score: {score}</p>
              <Button
                onClick={resetGame}
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
        <p>Click on any button. Each click makes the next one smaller. How small can you go?</p>
      </div>
    </div>
  )
}

