"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

const CELL_SIZE = 20
const MAZE_WIDTH = 15
const MAZE_HEIGHT = 15

type Position = {
  x: number
  y: number
}

export default function MirrorMaze() {
  const [playerPos, setPlayerPos] = useState<Position>({ x: 1, y: 1 })
  const [maze, setMaze] = useState<number[][]>([])
  const [gameState, setGameState] = useState<"playing" | "won">("playing")
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateMaze = useCallback(() => {
    const newMaze = Array(MAZE_HEIGHT)
      .fill(0)
      .map(() => Array(MAZE_WIDTH).fill(1))

    const stack: Position[] = []
    const start: Position = { x: 1, y: 1 }
    newMaze[start.y][start.x] = 0
    stack.push(start)

    while (stack.length > 0) {
      const current = stack[stack.length - 1]
      const neighbors = [
        { x: current.x + 2, y: current.y },
        { x: current.x - 2, y: current.y },
        { x: current.x, y: current.y + 2 },
        { x: current.x, y: current.y - 2 },
      ].filter((n) => n.x > 0 && n.x < MAZE_WIDTH - 1 && n.y > 0 && n.y < MAZE_HEIGHT - 1 && newMaze[n.y][n.x] === 1)

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)]
        newMaze[next.y][next.x] = 0
        newMaze[current.y + (next.y - current.y) / 2][current.x + (next.x - current.x) / 2] = 0
        stack.push(next)
      } else {
        stack.pop()
      }
    }

    // Set exit (randomly choose a side)
    const side = Math.floor(Math.random() * 4)
    let exitX, exitY
    switch (side) {
      case 0: // Top
        exitX = Math.floor(Math.random() * (MAZE_WIDTH - 2)) + 1
        exitY = 0
        break
      case 1: // Right
        exitX = MAZE_WIDTH - 1
        exitY = Math.floor(Math.random() * (MAZE_HEIGHT - 2)) + 1
        break
      case 2: // Bottom
        exitX = Math.floor(Math.random() * (MAZE_WIDTH - 2)) + 1
        exitY = MAZE_HEIGHT - 1
        break
      case 3: // Left
        exitX = 0
        exitY = Math.floor(Math.random() * (MAZE_HEIGHT - 2)) + 1
        break
    }
    newMaze[exitY][exitX] = 2 // Set exit

    setMaze(newMaze)
    setPlayerPos({ x: 1, y: 1 })
    setGameState("playing")
  }, [])

  const drawMaze = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 1) {
          ctx.fillStyle = "#22c55e"
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        } else if (cell === 2) {
          ctx.fillStyle = "#fbbf24"
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        }
      })
    })

    // Draw player
    ctx.fillStyle = "#3b82f6"
    ctx.beginPath()
    ctx.arc(
      playerPos.x * CELL_SIZE + CELL_SIZE / 2,
      playerPos.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 3,
      0,
      Math.PI * 2,
    )
    ctx.fill()
  }, [maze, playerPos])

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      setPlayerPos((prev) => {
        const newX = prev.x - dx
        const newY = prev.y - dy
        if (newX >= 0 && newX < MAZE_WIDTH && newY >= 0 && newY < MAZE_HEIGHT && maze[newY][newX] !== 1) {
          if (maze[newY][newX] === 2) {
            setGameState("won")
          }
          return { x: newX, y: newY }
        }
        return prev
      })
    },
    [maze],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          movePlayer(-1, 0)
          break
        case "ArrowRight":
          movePlayer(1, 0)
          break
        case "ArrowUp":
          movePlayer(0, -1)
          break
        case "ArrowDown":
          movePlayer(0, 1)
          break
      }
    },
    [movePlayer],
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      generateMaze()
    }, 1500)
    return () => clearTimeout(timer)
  }, [generateMaze])

  useEffect(() => {
    drawMaze()
  }, [drawMaze])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Mirror Maze...</p>
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
          <div className="text-xs">games.griffen.codes | Mirror Maze v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <h1 className="text-2xl font-bold mb-2">Mirror Maze</h1>
            <p className="text-sm mb-4">Navigate to the yellow exit using arrow keys. Controls are reversed!</p>
          </div>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={MAZE_WIDTH * CELL_SIZE}
              height={MAZE_HEIGHT * CELL_SIZE}
              className="border border-green-500"
            />
          </div>

          {gameState === "won" && (
            <div className="text-center">
              <p className="text-xl font-bold mb-4">Congratulations! You've escaped the Mirror Maze!</p>
              <Button
                onClick={generateMaze}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                New Game
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-center text-green-700">
        <p>Use arrow keys to navigate. Remember, the controls are reversed!</p>
      </div>
    </div>
  )
}

