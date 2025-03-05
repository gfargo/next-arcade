"use client"

import type React from "react"

import { useEffect } from "react"
import { useState, useRef, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

const CANVAS_WIDTH = 300
const CANVAS_HEIGHT = 400
const DOT_RADIUS = 5
const PATH_WIDTH = 40
const INITIAL_SPEED = 1
const SPEED_INCREMENT = 0.1
const DOT_MOVE_SPEED = 5 // Add this near the other constants

interface Point {
  x: number
  y: number
}

export default function StayOnTheLine() {
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [loading, setLoading] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotPositionRef = useRef<Point>({ x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50 })
  const pathPointsRef = useRef<Point[]>([])
  const speedRef = useRef(INITIAL_SPEED)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const generatePath = useCallback((): Point[] => {
    const points: Point[] = []
    let x = CANVAS_WIDTH / 2
    for (let y = CANVAS_HEIGHT; y > 0; y -= 5) {
      x += (Math.random() - 0.5) * 10
      x = Math.max(PATH_WIDTH / 2, Math.min(CANVAS_WIDTH - PATH_WIDTH / 2, x))
      points.push({ x, y })
    }
    return points
  }, [])

  const gameLoop = useCallback(() => {
    if (!gameStarted) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw path
    ctx.beginPath()
    ctx.moveTo(pathPointsRef.current[0].x, pathPointsRef.current[0].y)
    for (let i = 1; i < pathPointsRef.current.length; i++) {
      ctx.lineTo(pathPointsRef.current[i].x, pathPointsRef.current[i].y)
    }
    ctx.strokeStyle = "#22c55e"
    ctx.lineWidth = PATH_WIDTH
    ctx.stroke()

    // Draw dot
    ctx.beginPath()
    ctx.arc(dotPositionRef.current.x, dotPositionRef.current.y, DOT_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = "#ef4444"
    ctx.fill()

    // Move dot
    dotPositionRef.current.y -= speedRef.current
    if (dotPositionRef.current.y < 0) {
      dotPositionRef.current.y = CANVAS_HEIGHT
      setScore((prevScore) => prevScore + 1)
      speedRef.current += SPEED_INCREMENT
      pathPointsRef.current = generatePath()
    }

    // Check collision
    const currentPathSegment = pathPointsRef.current.find((point) => point.y >= dotPositionRef.current.y)
    if (currentPathSegment) {
      const distance = Math.abs(currentPathSegment.x - dotPositionRef.current.x)
      if (distance > PATH_WIDTH / 2 - DOT_RADIUS) {
        setGameOver(true)
        return
      }
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [gameStarted, generatePath]),
  \
  const initializeGame = useCallback(() => {
    setScore(0)
    setGameOver(false)
    setGameStarted(true)
    dotPositionRef.current = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 50 }
    pathPointsRef.current = generatePath()
    speedRef.current = INITIAL_SPEED
    if (canvasRef.current) {
      canvasRef.current.focus()
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [generatePath, gameLoop])

  useEffect(() => {
    if (gameStarted && !gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameStarted, gameOver, gameLoop])

  const handleTap = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameStarted) {
      initializeGame()
      return
    }
    if (gameOver) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const canvasMiddle = CANVAS_WIDTH / 2

    if (clickX < canvasMiddle) {
      // Move left
      dotPositionRef.current.x = Math.max(DOT_RADIUS, dotPositionRef.current.x - DOT_MOVE_SPEED)
    } else {
      // Move right
      dotPositionRef.current.x = Math.min(CANVAS_WIDTH - DOT_RADIUS, dotPositionRef.current.x + DOT_MOVE_SPEED)
    }
  }

  useEffect(() => {
    if (gameOver && animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameOver])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Stay on the Line...</p>
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
          <div className="text-xs">games.griffen.codes | Stay on the Line v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Stay on the Line</p>
            <p className="text-sm">Tap to keep the dot within the path!</p>
            <p className="text-lg mt-2">Score: {score}</p>
          </div>

          {!gameStarted ? (
            <div className="text-center">
              <button
                onClick={initializeGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
              >
                Start Game
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="border border-green-500 cursor-pointer"
                onClick={handleTap}
                tabIndex={0}
              />
            </div>
          )}

          {gameOver && (
            <div className="text-center">
              <p className="text-xl mb-4">Game Over! Your score: {score}</p>
              <button
                onClick={initializeGame}
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
          {gameStarted
            ? "Click on the left side to move the dot left, or the right side to move it right."
            : "Click 'Start Game' to begin!"}
        </p>
      </div>
    </div>
  )
}

