"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

const GRID_SIZE = 5

type Cell = {
  row: number
  col: number
}

export default function LightsOut() {
  const [grid, setGrid] = useState<boolean[][]>([])
  const [moves, setMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [timer, setTimer] = useState(0)
  const [bestTime, setBestTime] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const initializeGrid = useCallback(() => {
    const newGrid = Array(GRID_SIZE)
      .fill(null)
      .map(() => Array(GRID_SIZE).fill(false))
    // Randomly toggle cells to create a solvable puzzle
    for (let i = 0; i < GRID_SIZE * 2; i++) {
      const row = Math.floor(Math.random() * GRID_SIZE)
      const col = Math.floor(Math.random() * GRID_SIZE)
      toggleCell(newGrid, row, col)
    }
    return newGrid
  }, [])

  const toggleCell = (grid: boolean[][], row: number, col: number) => {
    const cells: Cell[] = [
      { row, col },
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ]

    cells.forEach((cell) => {
      if (cell.row >= 0 && cell.row < GRID_SIZE && cell.col >= 0 && cell.col < GRID_SIZE) {
        grid[cell.row][cell.col] = !grid[cell.row][cell.col]
      }
    })
  }

  const handleCellClick = (row: number, col: number) => {
    if (gameWon) return

    const newGrid = grid.map((row) => [...row])
    toggleCell(newGrid, row, col)
    setGrid(newGrid)
    setMoves(moves + 1)

    if (newGrid.every((row) => row.every((cell) => !cell))) {
      setGameWon(true)
      if (bestTime === null || timer < bestTime) {
        setBestTime(timer)
      }
    }
  }

  const resetGame = () => {
    setGrid(initializeGrid())
    setMoves(0)
    setGameWon(false)
    setTimer(0)
  }

  useEffect(() => {
    const newGrid = initializeGrid()
    setGrid(newGrid)
    setLoading(false)
  }, [initializeGrid])

  useEffect(() => {
    if (!loading && !gameWon) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [loading, gameWon])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Lights Out...</p>
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
          <div className="text-xs">games.griffen.codes | Lights Out v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Lights Out</p>
            <p className="text-sm">Turn off all the lights in the fewest moves!</p>
            <p className="text-lg mt-2">
              Moves: {moves} | Time: {timer}s{bestTime !== null && ` | Best Time: ${bestTime}s`}
            </p>
          </div>

          <div className="grid-container flex justify-center">
            <div className="inline-block border border-green-500">
              {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => (
                    <button
                      key={colIndex}
                      className={`w-12 h-12 border border-green-500 ${
                        cell ? "bg-green-500" : "bg-black"
                      } transition-colors duration-300`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      disabled={gameWon}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {gameWon && (
            <div className="text-center">
              <p className="text-xl mb-4">
                Congratulations! You won in {moves} moves and {timer} seconds!
              </p>
              <button
                onClick={resetGame}
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
        <p>Click on a cell to toggle its state and adjacent cells</p>
      </div>
    </div>
  )
}

