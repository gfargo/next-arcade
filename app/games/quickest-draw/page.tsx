"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

const GAME_DURATION = 30 // seconds
const TARGET_RADIUS = 20 // pixels
const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 400
const MISS_PENALTY = 2 // seconds

export default function QuickestDraw() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 })
  const [bestScore, setBestScore] = useState(0)
  const [averageAccuracy, setAverageAccuracy] = useState(0)
  const [loading, setLoading] = useState(true)
  const [targetOpacity, setTargetOpacity] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastTargetTimeRef = useRef(0)
  const totalAccuracyRef = useRef(0)
  const hitsRef = useRef(0)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

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

  const startGame = useCallback(() => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setTimeLeft(GAME_DURATION)
    totalAccuracyRef.current = 0
    hitsRef.current = 0
    setAverageAccuracy(0)
    spawnTarget()
  }, [])

  const endGame = useCallback(() => {
    setGameOver(true)
    if (score > bestScore) {
      setBestScore(score)
    }
    const avgAccuracy = totalAccuracyRef.current / hitsRef.current
    setAverageAccuracy(avgAccuracy)
  }, [score, bestScore])

  const spawnTarget = useCallback(() => {
    const x = Math.random() * (CANVAS_WIDTH - TARGET_RADIUS * 2) + TARGET_RADIUS
    const y = Math.random() * (CANVAS_HEIGHT - TARGET_RADIUS * 2) + TARGET_RADIUS
    setTargetPosition({ x, y })
    setTargetOpacity(0)
    lastTargetTimeRef.current = Date.now()

    // Fade in
    const fadeIn = setInterval(() => {
      setTargetOpacity((prev) => {
        if (prev >= 1) {
          clearInterval(fadeIn)
          return 1
        }
        return prev + 0.1
      })
    }, 6.5) // 65ms / 10 steps
  }, [])

  const calculateDistance = useCallback((x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  }, [])

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!gameStarted || gameOver) return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const distance = calculateDistance(x, y, targetPosition.x, targetPosition.y)

      if (distance <= TARGET_RADIUS) {
        const accuracy = 1 - distance / TARGET_RADIUS
        const points = Math.round(100 * accuracy)
        totalAccuracyRef.current += accuracy
        hitsRef.current++

        setScore((prevScore) => prevScore + points)

        // Fade out
        const fadeOut = setInterval(() => {
          setTargetOpacity((prev) => {
            if (prev <= 0) {
              clearInterval(fadeOut)
              spawnTarget()
              return 0
            }
            return prev - 0.1
          })
        }, 6.5) // 65ms / 10 steps
      } else {
        // Miss penalty
        setTimeLeft((prevTime) => Math.max(0, prevTime - MISS_PENALTY))
      }
    },
    [gameStarted, gameOver, targetPosition, calculateDistance, spawnTarget],
  )

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const drawGame = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw target
      ctx.fillStyle = `rgba(239, 68, 68, ${targetOpacity})`
      ctx.beginPath()
      ctx.arc(targetPosition.x, targetPosition.y, TARGET_RADIUS, 0, Math.PI * 2)
      ctx.fill()

      // Draw crosshair
      ctx.strokeStyle = `rgba(34, 197, 94, ${targetOpacity})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(targetPosition.x - TARGET_RADIUS, targetPosition.y)
      ctx.lineTo(targetPosition.x + TARGET_RADIUS, targetPosition.y)
      ctx.moveTo(targetPosition.x, targetPosition.y - TARGET_RADIUS)
      ctx.lineTo(targetPosition.x, targetPosition.y + TARGET_RADIUS)
      ctx.stroke()
    }

    const animationFrame = requestAnimationFrame(drawGame)
    return () => cancelAnimationFrame(animationFrame)
  }, [gameStarted, gameOver, targetPosition, targetOpacity])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Quickest Draw...</p>
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
          <div className="text-xs">games.griffen.codes | Quickest Draw v1.1</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Quickest Draw</p>
            <p className="text-sm">Click the targets as fast and accurately as you can!</p>
            {gameStarted && !gameOver && (
              <p className="text-lg mt-2">
                Score: {score} | Time: {timeLeft}s
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border border-green-500 cursor-crosshair"
              onClick={handleCanvasClick}
            />
          </div>

          {!gameStarted && (
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
              <p className="text-lg mb-2">Best score: {bestScore}</p>
              <p className="text-lg mb-4">Average accuracy: {(averageAccuracy * 100).toFixed(2)}%</p>
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
        <p>Click on the targets as quickly and accurately as possible. Misses will cost you time!</p>
      </div>
    </div>
  )
}

