"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

const GRID_SIZE = 4
const INITIAL_DISPLAY_TIME = 1000 // 1 second
const GAME_DURATION = 60 // 60 seconds

const emojis = ["😀", "😎", "🤔", "🤓", "😍", "🤯", "🥳", "😴", "🤠", "🤡", "👽", "🤖", "👻", "💀", "👾", "🐱"]

const initializeGrid = () => {
  return Array.from({ length: GRID_SIZE * GRID_SIZE }, () => emojis[Math.floor(Math.random() * emojis.length)])
}

export default function WhatChanged() {
  const [grid, setGrid] = useState<string[]>([])
  const [changedIndex, setChangedIndex] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [bestScore, setBestScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [changeTime, setChangeTime] = useState<number | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const startGame = useCallback(() => {
    const initialGrid = initializeGrid()
    setGrid(initialGrid)
    setScore(0)
    setTimeLeft(GAME_DURATION)
    setGameStarted(true)
    setGameOver(false)
    setChangedIndex(null)

    setTimeout(() => {
      changeRandomEmoji()
    }, INITIAL_DISPLAY_TIME)
  }, [])

  const changeRandomEmoji = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    // First show all emojis
    setChangedIndex(null)
    setChangeTime(null)

    timerRef.current = setTimeout(() => {
      setGrid((prevGrid) => {
        const newGrid = [...prevGrid]
        const index = Math.floor(Math.random() * newGrid.length)
        let newEmoji = emojis[Math.floor(Math.random() * emojis.length)]

        // Make sure the new emoji is different from the current one
        while (newEmoji === newGrid[index]) {
          newEmoji = emojis[Math.floor(Math.random() * emojis.length)]
        }

        newGrid[index] = newEmoji
        setChangedIndex(index)
        setChangeTime(Date.now())
        return newGrid
      })
    }, INITIAL_DISPLAY_TIME)
  }, [])

  const handleEmojiClick = useCallback(
    (index: number) => {
      if (!gameStarted || gameOver || changedIndex === null || changeTime === null) return

      const responseTime = Date.now() - changeTime
      const maxPoints = 100
      const minPoints = 10
      const timeThreshold = 2000 // 2 seconds

      if (index === changedIndex) {
        const points = Math.max(minPoints, Math.round(maxPoints * (1 - responseTime / timeThreshold)))
        setScore((prevScore) => prevScore + points)
        changeRandomEmoji()
      } else {
        setScore((prevScore) => Math.max(0, prevScore - 10))
      }
    },
    [gameStarted, gameOver, changedIndex, changeTime, changeRandomEmoji],
  )

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
  }, [gameStarted, gameOver])

  const endGame = useCallback(() => {
    setGameOver(true)
    if (score > bestScore) {
      setBestScore(score)
    }
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [score, bestScore])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading What Changed?...</p>
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
          <div className="text-xs">games.griffen.codes | What Changed? v1.1</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">What Changed?</p>
            <p className="text-sm">Spot the emoji that changes! The faster you click, the more points you earn!</p>
            {gameStarted && !gameOver && (
              <div className="text-lg mt-2">
                <p>
                  Score: {score} | Time: {timeLeft}s
                </p>
                <p className="text-sm">
                  Current Multiplier:{" "}
                  {changeTime ? `${Math.max(1, Math.round(100 * (1 - (Date.now() - changeTime) / 2000)))}x` : "1x"}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4 max-w-xs mx-auto">
            {grid.map((emoji, index) => (
              <button
                key={index}
                className="w-14 h-14 text-4xl bg-green-900 bg-opacity-30 border border-green-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                onClick={() => handleEmojiClick(index)}
                disabled={!gameStarted || gameOver}
              >
                {emoji}
              </button>
            ))}
          </div>

          {!gameStarted && !gameOver && (
            <div className="text-center">
              <button
                onClick={startGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
              >
                Start Game
              </button>
            </div>
          )}

          {gameOver && (
            <div className="text-center">
              <p className="text-xl mb-4">Game Over!</p>
              <p className="text-lg mb-2">Your score: {score}</p>
              <p className="text-lg mb-4">Best score: {bestScore}</p>
              <button
                onClick={startGame}
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
        <p>
          Watch the grid carefully and click on the emoji that changes. Be quick! Faster responses earn more points.
        </p>
        <p>Max points: 100 (instant) | Min points: 10 (after 2 seconds) | Incorrect guess: -10 points</p>
      </div>
    </div>
  )
}

