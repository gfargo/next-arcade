"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

interface DifficultyLevel {
  name: string
  colorCount: number
}

const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  { name: "Easy", colorCount: 4 },
  { name: "Medium", colorCount: 6 },
  { name: "Hard", colorCount: 9 },
  { name: "Expert", colorCount: 16 },
]

const COLORS = ["red", "green", "blue", "yellow", "purple", "orange", "pink", "cyan", "magenta", "lime"]

export default function SimonSays() {
  const [loading, setLoading] = useState(true)
  const [sequence, setSequence] = useState<number[]>([])
  const [playerSequence, setPlayerSequence] = useState<number[]>([])
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(DIFFICULTY_LEVELS[0])

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const startNewGame = useCallback(() => {
    setSequence([])
    setPlayerSequence([])
    setGameOver(false)
    setGameStarted(true)
    setScore(0)
    addToSequence()
  }, [])

  const addToSequence = useCallback(() => {
    const newColor = Math.floor(Math.random() * difficulty.colorCount)
    setSequence((prevSequence) => [...prevSequence, newColor])
  }, [difficulty])

  const playSequence = useCallback(() => {
    sequence.forEach((colorIndex, index) => {
      setTimeout(
        () => {
          flashColor(colorIndex)
        },
        (index + 1) * 600,
      )
    })
  }, [sequence])

  const flashColor = (colorIndex: number) => {
    const element = document.getElementById(`color-${colorIndex}`)
    if (element) {
      element.classList.add("opacity-100")
      element.classList.add("scale-110")
      setTimeout(() => {
        element.classList.remove("opacity-100")
        element.classList.remove("scale-110")
      }, 300)
    }
  }

  const handleColorClick = (colorIndex: number) => {
    if (!gameStarted || gameOver) return

    flashColor(colorIndex)

    const newPlayerSequence = [...playerSequence, colorIndex]
    setPlayerSequence(newPlayerSequence)

    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      setGameOver(true)
      setHighScore((prevHighScore) => Math.max(prevHighScore, score))
      return
    }

    if (newPlayerSequence.length === sequence.length) {
      setScore(score + 1)
      setPlayerSequence([])
      setTimeout(() => {
        addToSequence()
      }, 1000)
    }
  }

  useEffect(() => {
    if (sequence.length > 0 && gameStarted) {
      const timer = setTimeout(() => {
        playSequence()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [sequence, gameStarted, playSequence])

  const handleDifficultyChange = (newDifficulty: DifficultyLevel) => {
    setDifficulty(newDifficulty)
    setGameStarted(false)
    setGameOver(false)
    setSequence([])
    setPlayerSequence([])
    setScore(0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Simon Says...</p>
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
          <div className="text-xs">games.griffen.codes | Simon Says v2.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Simon Says</p>
            <p className="text-sm">Repeat the sequence of colors!</p>
            {gameStarted && <p className="text-lg mt-2">Score: {score}</p>}
            {!gameStarted && (
              <div className="mt-4">
                <p className="text-sm mb-2">Select Difficulty:</p>
                <div className="flex justify-center space-x-2">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <button
                      key={level.name}
                      onClick={() => handleDifficultyChange(level)}
                      className={`px-2 py-1 border ${
                        difficulty.name === level.name ? "bg-green-900 bg-opacity-50" : ""
                      } border-green-500 hover:bg-green-900 hover:bg-opacity-30 text-xs`}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="game-board flex justify-center items-center">
            <div className={`grid gap-4 ${difficulty.colorCount <= 4 ? "grid-cols-2" : "grid-cols-3"}`}>
              {COLORS.slice(0, difficulty.colorCount).map((color, index) => (
                <button
                  key={color}
                  id={`color-${index}`}
                  onClick={() => handleColorClick(index)}
                  className={`w-20 h-20 rounded-full transition-all duration-300 opacity-50 transform hover:scale-105 ${
                    color === "red"
                      ? "bg-red-500"
                      : color === "green"
                        ? "bg-green-500"
                        : color === "blue"
                          ? "bg-blue-500"
                          : color === "yellow"
                            ? "bg-yellow-500"
                            : color === "purple"
                              ? "bg-purple-500"
                              : color === "orange"
                                ? "bg-orange-500"
                                : color === "pink"
                                  ? "bg-pink-500"
                                  : color === "cyan"
                                    ? "bg-cyan-500"
                                    : color === "magenta"
                                      ? "bg-fuchsia-500"
                                      : "bg-lime-500"
                  }`}
                  disabled={!gameStarted || gameOver}
                />
              ))}
            </div>
          </div>

          {!gameStarted && (
            <div className="text-center">
              <button
                onClick={startNewGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
              >
                Start Game
              </button>
            </div>
          )}

          {gameOver && (
            <div className="text-center">
              <p className="text-xl mb-4">Game Over! Your score: {score}</p>
              <p className="text-lg mb-4">High Score: {highScore}</p>
              <button
                onClick={startNewGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30 flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-center text-green-700">
        <p>Watch the sequence, then click the colors in the same order</p>
        <p>
          Difficulty: {difficulty.name} - {difficulty.colorCount} colors
        </p>
      </div>
    </div>
  )
}

