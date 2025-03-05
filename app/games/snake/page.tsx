"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT"
type Position = { x: number; y: number }

export default function SnakeGame() {
  const [loading, setLoading] = useState(true)
  const [gameOver, setGameOver] = useState(false)
  const [paused, setPaused] = useState(false)
  const [score, setScore] = useState(0)
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [food, setFood] = useState<Position>({ x: 5, y: 5 })
  const [direction, setDirection] = useState<Direction>("RIGHT")
  const [speed, setSpeed] = useState(150)

  const gridSize = 20
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize the game
  useEffect(() => {
    // Simulate loading for terminal effect
    const timer = setTimeout(() => {
      setLoading(false)
      resetGame()
    }, 1500)

    return () => {
      clearTimeout(timer)
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [])

  // Set up keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) {
        if (e.key === "r" || e.key === "R") resetGame()
        return
      }

      if (e.key === "p" || e.key === "P") {
        setPaused((prev) => !prev)
        return
      }

      if (paused) return

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (direction !== "DOWN") setDirection("UP")
          break
        case "ArrowDown":
        case "s":
        case "S":
          if (direction !== "UP") setDirection("DOWN")
          break
        case "ArrowLeft":
        case "a":
        case "A":
          if (direction !== "RIGHT") setDirection("LEFT")
          break
        case "ArrowRight":
        case "d":
        case "D":
          if (direction !== "LEFT") setDirection("RIGHT")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [direction, gameOver, paused])

  // Game loop
  useEffect(() => {
    if (loading || gameOver || paused) return

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake]
        const head = { ...newSnake[0] }

        // Move head based on direction
        switch (direction) {
          case "UP":
            head.y -= 1
            break
          case "DOWN":
            head.y += 1
            break
          case "LEFT":
            head.x -= 1
            break
          case "RIGHT":
            head.x += 1
            break
        }

        // Check if snake hit the wall
        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
          setGameOver(true)
          return prevSnake
        }

        // Check if snake hit itself
        for (let i = 0; i < newSnake.length; i++) {
          if (newSnake[i].x === head.x && newSnake[i].y === head.y) {
            setGameOver(true)
            return prevSnake
          }
        }

        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
          setScore((prev) => prev + 10)
          setFood(generateFood(newSnake))

          // Increase speed every 50 points
          if (score > 0 && score % 50 === 0) {
            setSpeed((prev) => Math.max(prev - 10, 50))
          }

          // Don't remove tail when eating food
        } else {
          // Remove tail
          newSnake.pop()
        }

        // Add new head
        newSnake.unshift(head)
        return newSnake
      })
    }

    gameLoopRef.current = setInterval(moveSnake, speed)

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [direction, food, gameOver, loading, paused, score, speed])

  const generateFood = (snakeBody: Position[]): Position => {
    let newFood: Position
    let foodOnSnake = true

    while (foodOnSnake) {
      foodOnSnake = false
      newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize),
      }

      // Check if food is on snake
      for (const segment of snakeBody) {
        if (segment.x === newFood.x && segment.y === newFood.y) {
          foodOnSnake = true
          break
        }
      }
    }

    return newFood!
  }

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }])
    setFood(generateFood([{ x: 10, y: 10 }]))
    setDirection("RIGHT")
    setScore(0)
    setGameOver(false)
    setPaused(false)
    setSpeed(150)
  }

  const renderGrid = () => {
    const grid = []

    for (let y = 0; y < gridSize; y++) {
      const row = []
      for (let x = 0; x < gridSize; x++) {
        // Check if current cell is snake
        let isSnake = false
        let isHead = false
        for (let i = 0; i < snake.length; i++) {
          if (snake[i].x === x && snake[i].y === y) {
            isSnake = true
            isHead = i === 0
            break
          }
        }

        // Check if current cell is food
        const isFood = food.x === x && food.y === y

        let cellContent = "·"
        if (isSnake) {
          cellContent = isHead ? "█" : "▓"
        } else if (isFood) {
          cellContent = "★"
        }

        row.push(
          <span
            key={`${x}-${y}`}
            className={`inline-block w-5 text-center ${
              isSnake ? (isHead ? "text-yellow-400" : "text-green-500") : isFood ? "text-red-500" : "text-green-900"
            }`}
          >
            {cellContent}
          </span>,
        )
      }
      grid.push(
        <div key={y} className="flex justify-center">
          {row}
        </div>,
      )
    }

    return grid
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Snake...</p>
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
          <div className="text-xs">games.griffen.codes | Snake v1.0</div>
        </div>

        <div className="game-container">
          <div className="game-info flex justify-between mb-4">
            <div className="score">
              Score: <span className="text-yellow-400">{score}</span>
            </div>
            <div className="status">
              {gameOver ? (
                <span className="text-red-500">Game Over!</span>
              ) : paused ? (
                <span className="text-yellow-400">Paused</span>
              ) : (
                <span>Playing</span>
              )}
            </div>
          </div>

          <div className="game-grid border border-green-700 inline-block mx-auto">{renderGrid()}</div>

          <div className="controls flex justify-center gap-4 mt-6">
            {gameOver ? (
              <button
                onClick={resetGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Play Again
              </button>
            ) : (
              <button
                onClick={() => setPaused((prev) => !prev)}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
              >
                {paused ? "Resume" : "Pause"}
              </button>
            )}
          </div>

          <div className="instructions mt-6 text-sm text-green-700">
            <p className="text-center">Use arrow keys or WASD to control the snake</p>
            <p className="text-center">P to pause, R to restart</p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-center text-green-700">
        <p>Classic Snake Game - Terminal Edition</p>
      </div>
    </div>
  )
}

