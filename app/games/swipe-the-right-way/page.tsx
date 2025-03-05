"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw, ArrowUp, ArrowDown, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const GAME_DURATION = 30 // seconds
const INITIAL_INTERVAL = 2000 // 2 seconds
const MIN_INTERVAL = 500 // 0.5 seconds
const INTERVAL_DECREASE = 100 // 0.1 seconds

type Direction = "up" | "down" | "right"

export default function SwipeTheRightWay() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [currentDirection, setCurrentDirection] = useState<Direction | null>(null)
  const [loading, setLoading] = useState(true)
  const [interval, setInterval] = useState(INITIAL_INTERVAL)

  const containerRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const startY = useRef(0)

  useEffect(() => {
    const storedHighScore = localStorage.getItem("swipeTheRightWayHighScore")
    if (storedHighScore) {
      setHighScore(Number(storedHighScore))
    }
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const generateDirection = useCallback(() => {
    const directions: Direction[] = ["up", "down", "right"]
    const newDirection = directions[Math.floor(Math.random() * directions.length)]
    setCurrentDirection(newDirection)
  }, [])

  const startGame = useCallback(() => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setTimeLeft(GAME_DURATION)
    setInterval(INITIAL_INTERVAL)
    generateDirection()
  }, [generateDirection])

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer)
            setGameOver(true)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [gameStarted, gameOver])

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const directionTimer = setInterval(() => {
        generateDirection()
        setInterval((prevInterval) => Math.max(prevInterval - INTERVAL_DECREASE, MIN_INTERVAL))
      }, interval)

      return () => clearInterval(directionTimer)
    }
  }, [gameStarted, gameOver, generateDirection, interval])

  const handleSwipe = useCallback(
    (direction: Direction) => {
      if (direction === currentDirection) {
        setScore((prevScore) => prevScore + 1)
        playSound("correct")
      } else {
        setScore((prevScore) => Math.max(0, prevScore - 1))
        playSound("incorrect")
      }
      generateDirection()
    },
    [currentDirection, generateDirection],
  )

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const deltaX = endX - startX.current
    const deltaY = endY - startY.current

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        handleSwipe("right")
      }
    } else {
      if (deltaY > 0) {
        handleSwipe("down")
      } else {
        handleSwipe("up")
      }
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    startX.current = e.clientX
    startY.current = e.clientY
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    const endX = e.clientX
    const endY = e.clientY
    const deltaX = endX - startX.current
    const deltaY = endY - startY.current

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        handleSwipe("right")
      }
    } else {
      if (deltaY > 0) {
        handleSwipe("down")
      } else {
        handleSwipe("up")
      }
    }
  }

  const playSound = (type: "correct" | "incorrect") => {
    const audio = new Audio(type === "correct" ? "/sounds/correct.mp3" : "/sounds/incorrect.mp3")
    audio.play()
  }

  useEffect(() => {
    if (gameOver) {
      if (score > highScore) {
        setHighScore(score)
        localStorage.setItem("swipeTheRightWayHighScore", score.toString())
      }
    }
  }, [gameOver, score, highScore])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Swipe the Right Way...</p>
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
          <div className="text-xs">games.griffen.codes | Swipe the Right Way v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <h1 className="text-2xl font-bold mb-2">Swipe the Right Way</h1>
            <p className="text-sm mb-4">Swipe in the direction of the arrow as fast as you can!</p>
            {gameStarted && !gameOver && (
              <div className="mb-4">
                <p>Score: {score}</p>
                <p>Time Left: {timeLeft}s</p>
              </div>
            )}
          </div>

          <div
            ref={containerRef}
            className="game-area flex flex-col items-center justify-center h-64 border-2 border-green-500 rounded-md"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            {gameStarted && !gameOver ? (
              <div className="text-6xl">
                {currentDirection === "up" && <ArrowUp />}
                {currentDirection === "down" && <ArrowDown />}
                {currentDirection === "right" && <ArrowRight />}
              </div>
            ) : (
              <p className="text-xl">Swipe area</p>
            )}
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

          {gameOver && (
            <div className="text-center">
              <p className="text-xl mb-4">Game Over!</p>
              <p className="mb-2">Your score: {score}</p>
              <p className="mb-4">High score: {highScore}</p>
              <Button
                onClick={startGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30 flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Play Again
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-center text-green-700">
        <p>Swipe or drag your mouse in the direction of the arrow. Be quick!</p>
      </div>
    </div>
  )
}

