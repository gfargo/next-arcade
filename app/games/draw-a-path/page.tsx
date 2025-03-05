"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

const CANVAS_WIDTH = 300
const CANVAS_HEIGHT = 400
const POINT_RADIUS = 5
const OBSTACLE_RADIUS = 10

interface Point {
  x: number
  y: number
}

interface Level {
  points: Point[]
  obstacles: Point[]
}

const levels: Level[] = [
  {
    points: [
      { x: 50, y: 50 },
      { x: 250, y: 350 },
    ],
    obstacles: [{ x: 150, y: 200 }],
  },
  {
    points: [
      { x: 50, y: 50 },
      { x: 250, y: 200 },
      { x: 50, y: 350 },
    ],
    obstacles: [
      { x: 150, y: 100 },
      { x: 150, y: 300 },
    ],
  },
  {
    points: [
      { x: 50, y: 50 },
      { x: 250, y: 50 },
      { x: 250, y: 350 },
      { x: 50, y: 350 },
    ],
    obstacles: [
      { x: 150, y: 150 },
      { x: 150, y: 250 },
      { x: 100, y: 200 },
      { x: 200, y: 200 },
    ],
  },
]

export default function DrawAPath() {
  const [currentLevel, setCurrentLevel] = useState(0)
  const [path, setPath] = useState<Point[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (loading) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const drawLevel = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw points
      ctx.fillStyle = "#22c55e"
      levels[currentLevel].points.forEach((point) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, POINT_RADIUS, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw obstacles
      ctx.fillStyle = "#ef4444"
      levels[currentLevel].obstacles.forEach((obstacle) => {
        ctx.beginPath()
        ctx.arc(obstacle.x, obstacle.y, OBSTACLE_RADIUS, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw path
      if (path.length > 1) {
        ctx.strokeStyle = "#22c55e"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(path[0].x, path[0].y)
        for (let i = 1; i < path.length; i++) {
          ctx.lineTo(path[i].x, path[i].y)
        }
        ctx.stroke()
      }
    }

    drawLevel()
  }, [currentLevel, path, loading])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameOver || levelCompleted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const startPoint = levels[currentLevel].points[0]
    if (Math.hypot(x - startPoint.x, y - startPoint.y) <= POINT_RADIUS) {
      setIsDrawing(true)
      setPath([{ x, y }])
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || gameOver || levelCompleted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setPath((prevPath) => [...prevPath, { x, y }])

    // Check collision with obstacles
    const hitObstacle = levels[currentLevel].obstacles.some(
      (obstacle) => Math.hypot(x - obstacle.x, y - obstacle.y) <= OBSTACLE_RADIUS,
    )

    if (hitObstacle) {
      setGameOver(true)
      setIsDrawing(false)
      playSound("gameover")
    }

    // Check if reached end point
    const endPoint = levels[currentLevel].points[levels[currentLevel].points.length - 1]
    if (Math.hypot(x - endPoint.x, y - endPoint.y) <= POINT_RADIUS) {
      setLevelCompleted(true)
      setIsDrawing(false)
      playSound("success")
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
    if (!levelCompleted && !gameOver) {
      setPath([])
    }
  }

  const startNextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel((prevLevel) => prevLevel + 1)
      setPath([])
      setLevelCompleted(false)
    } else {
      // Game completed
      setGameOver(true)
    }
  }

  const restartGame = () => {
    setCurrentLevel(0)
    setPath([])
    setGameOver(false)
    setLevelCompleted(false)
  }

  const playSound = (type: "success" | "gameover") => {
    const audio = new Audio(type === "success" ? "/sounds/success.mp3" : "/sounds/gameover.mp3")
    audio.play()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Draw a Path...</p>
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
          <div className="text-xs">games.griffen.codes | Draw a Path v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Draw a Path</p>
            <p className="text-sm">Connect the points while avoiding obstacles!</p>
            <p className="text-lg mt-2">Level: {currentLevel + 1}</p>
          </div>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border border-green-500 cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          {levelCompleted && !gameOver && (
            <div className="text-center">
              <p className="text-xl mb-4">Level Completed!</p>
              <button
                onClick={startNextLevel}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
              >
                Next Level
              </button>
            </div>
          )}

          {gameOver && (
            <div className="text-center">
              <p className="text-xl mb-4">
                {currentLevel === levels.length - 1 ? "Congratulations! You completed all levels!" : "Game Over!"}
              </p>
              <button
                onClick={restartGame}
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
        <p>Click and drag to draw a path connecting the green points. Avoid the red obstacles!</p>
      </div>
    </div>
  )
}

