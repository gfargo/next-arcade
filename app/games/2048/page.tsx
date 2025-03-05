"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

const GRID_SIZE = 4
const CELL_COUNT = GRID_SIZE * GRID_SIZE

export default function Game2048() {
  const [board, setBoard] = useState<number[]>(Array(CELL_COUNT).fill(0))
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      initializeBoard()
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const initializeBoard = () => {
    const newBoard = Array(CELL_COUNT).fill(0)
    addNewTile(newBoard)
    addNewTile(newBoard)
    setBoard(newBoard)
    setScore(0)
    setGameOver(false)
  }

  const addNewTile = (currentBoard: number[]) => {
    const emptyTiles = currentBoard.reduce((acc, tile, index) => {
      if (tile === 0) acc.push(index)
      return acc
    }, [] as number[])

    if (emptyTiles.length > 0) {
      const randomIndex = emptyTiles[Math.floor(Math.random() * emptyTiles.length)]
      currentBoard[randomIndex] = Math.random() < 0.9 ? 2 : 4
    }
  }

  const move = (direction: "up" | "down" | "left" | "right") => {
    if (gameOver) return

    const newBoard = [...board]
    let changed = false
    let newScore = score

    const moveAndMergeTiles = (line: number[]) => {
      const movedLine = line.filter((tile) => tile !== 0)
      for (let i = 0; i < movedLine.length - 1; i++) {
        if (movedLine[i] === movedLine[i + 1]) {
          movedLine[i] *= 2
          newScore += movedLine[i]
          movedLine.splice(i + 1, 1)
        }
      }
      while (movedLine.length < GRID_SIZE) {
        movedLine.push(0)
      }
      return movedLine
    }

    if (direction === "left" || direction === "right") {
      for (let row = 0; row < GRID_SIZE; row++) {
        const currentRow = newBoard.slice(row * GRID_SIZE, (row + 1) * GRID_SIZE)
        const movedRow =
          direction === "left" ? moveAndMergeTiles(currentRow) : moveAndMergeTiles(currentRow.reverse()).reverse()
        if (JSON.stringify(currentRow) !== JSON.stringify(movedRow)) {
          changed = true
        }
        movedRow.forEach((tile, index) => {
          newBoard[row * GRID_SIZE + index] = tile
        })
      }
    } else {
      for (let col = 0; col < GRID_SIZE; col++) {
        const currentCol = [
          newBoard[col],
          newBoard[col + GRID_SIZE],
          newBoard[col + GRID_SIZE * 2],
          newBoard[col + GRID_SIZE * 3],
        ]
        const movedCol =
          direction === "up" ? moveAndMergeTiles(currentCol) : moveAndMergeTiles(currentCol.reverse()).reverse()
        if (JSON.stringify(currentCol) !== JSON.stringify(movedCol)) {
          changed = true
        }
        movedCol.forEach((tile, index) => {
          newBoard[col + GRID_SIZE * index] = tile
        })
      }
    }

    if (changed) {
      addNewTile(newBoard)
      setBoard(newBoard)
      setScore(newScore)
      if (isGameOver(newBoard)) {
        setGameOver(true)
      }
    }
  }

  const isGameOver = (currentBoard: number[]) => {
    if (currentBoard.includes(0)) return false

    for (let i = 0; i < CELL_COUNT; i++) {
      if (
        (i % GRID_SIZE < GRID_SIZE - 1 && currentBoard[i] === currentBoard[i + 1]) ||
        (i < CELL_COUNT - GRID_SIZE && currentBoard[i] === currentBoard[i + GRID_SIZE])
      ) {
        return false
      }
    }

    return true
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          move("up")
          break
        case "ArrowDown":
          move("down")
          break
        case "ArrowLeft":
          move("left")
          break
        case "ArrowRight":
          move("right")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, []) //Fixed useEffect dependency

  const getTileColor = (value: number) => {
    const colors = {
      2: "bg-green-200 text-green-800",
      4: "bg-green-300 text-green-800",
      8: "bg-green-400 text-green-800",
      16: "bg-green-500 text-white",
      32: "bg-green-600 text-white",
      64: "bg-green-700 text-white",
      128: "bg-yellow-200 text-yellow-800",
      256: "bg-yellow-300 text-yellow-800",
      512: "bg-yellow-400 text-yellow-800",
      1024: "bg-yellow-500 text-white",
      2048: "bg-yellow-600 text-white",
    }
    return colors[value as keyof typeof colors] || "bg-gray-700 text-white"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading 2048...</p>
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
          <div className="text-xs">games.griffen.codes | 2048 v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">2048</p>
            <p className="text-sm">Combine tiles to reach 2048!</p>
            <p className="text-lg mt-2">Score: {score}</p>
          </div>

          <div className="game-board grid grid-cols-4 gap-2 max-w-xs mx-auto">
            {board.map((tile, index) => (
              <motion.div
                key={index}
                className={`w-16 h-16 flex items-center justify-center text-2xl font-bold rounded ${getTileColor(tile)}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {tile !== 0 && tile}
              </motion.div>
            ))}
          </div>

          <div className="controls flex justify-center gap-4">
            <button
              onClick={() => move("up")}
              className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
            >
              Up
            </button>
            <button
              onClick={() => move("down")}
              className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
            >
              Down
            </button>
            <button
              onClick={() => move("left")}
              className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
            >
              Left
            </button>
            <button
              onClick={() => move("right")}
              className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
            >
              Right
            </button>
          </div>

          {gameOver && (
            <div className="text-center">
              <p className="text-xl mb-4">Game Over!</p>
              <button
                onClick={initializeBoard}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30 flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                New Game
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-center text-green-700">
        <p>Use arrow keys or buttons to move tiles</p>
      </div>
    </div>
  )
}

