"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

const GRID_SIZE = 5
const COLORS = ["red", "green", "blue", "yellow", "purple"]

type Tile = {
  color: string
  matched: boolean
}

export default function ColorSwap() {
  const [grid, setGrid] = useState<Tile[][]>([])
  const [moves, setMoves] = useState(0)
  const [selectedTile, setSelectedTile] = useState<[number, number] | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      initializeGame()
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const initializeGame = () => {
    const newGrid: Tile[][] = []
    for (let i = 0; i < GRID_SIZE; i++) {
      const row: Tile[] = []
      for (let j = 0; j < GRID_SIZE; j++) {
        row.push({
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          matched: false,
        })
      }
      newGrid.push(row)
    }
    setGrid(newGrid)
    setMoves(0)
    setSelectedTile(null)
    setGameOver(false)
  }

  const handleTileClick = (row: number, col: number) => {
    if (gameOver) return

    if (selectedTile === null) {
      setSelectedTile([row, col])
    } else {
      const [selectedRow, selectedCol] = selectedTile
      if (
        (Math.abs(selectedRow - row) === 1 && selectedCol === col) ||
        (Math.abs(selectedCol - col) === 1 && selectedRow === row)
      ) {
        swapTiles(selectedRow, selectedCol, row, col)
        setSelectedTile(null)
        setMoves((prevMoves) => prevMoves + 1)
      } else {
        setSelectedTile([row, col])
      }
    }
  }

  const swapTiles = (row1: number, col1: number, row2: number, col2: number) => {
    const newGrid = [...grid]
    const temp = newGrid[row1][col1]
    newGrid[row1][col1] = newGrid[row2][col2]
    newGrid[row2][col2] = temp
    setGrid(newGrid)

    checkMatches()
  }

  const checkMatches = () => {
    let matched = false
    const newGrid = grid.map((row) => row.map((tile) => ({ ...tile, matched: false })))

    // Check horizontal matches
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE - 2; j++) {
        if (newGrid[i][j].color === newGrid[i][j + 1].color && newGrid[i][j].color === newGrid[i][j + 2].color) {
          newGrid[i][j].matched = true
          newGrid[i][j + 1].matched = true
          newGrid[i][j + 2].matched = true
          matched = true
        }
      }
    }

    // Check vertical matches
    for (let i = 0; i < GRID_SIZE - 2; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (newGrid[i][j].color === newGrid[i + 1][j].color && newGrid[i][j].color === newGrid[i + 2][j].color) {
          newGrid[i][j].matched = true
          newGrid[i + 1][j].matched = true
          newGrid[i + 2][j].matched = true
          matched = true
        }
      }
    }

    if (matched) {
      setGrid(newGrid)
      setTimeout(() => {
        removeMatches()
      }, 300)
    } else {
      checkGameOver()
    }
  }

  const removeMatches = () => {
    const newGrid = grid.map((row) =>
      row.map((tile) =>
        tile.matched ? { color: COLORS[Math.floor(Math.random() * COLORS.length)], matched: false } : tile,
      ),
    )
    setGrid(newGrid)
    checkGameOver()
  }

  const checkGameOver = () => {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (
          (j < GRID_SIZE - 2 &&
            grid[i][j].color === grid[i][j + 1].color &&
            grid[i][j].color === grid[i][j + 2].color) ||
          (i < GRID_SIZE - 2 && grid[i][j].color === grid[i + 1][j].color && grid[i][j].color === grid[i + 2][j].color)
        ) {
          return // Game is not over
        }
      }
    }
    setGameOver(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Color Swap...</p>
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
          <div className="text-xs">games.griffen.codes | Color Swap v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Color Swap</p>
            <p className="text-sm">Swap tiles to match colors in the fewest moves!</p>
            <p className="text-lg mt-2">Moves: {moves}</p>
          </div>

          <div className="grid-container flex justify-center">
            <div className="inline-block border border-green-500">
              {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((tile, colIndex) => (
                    <button
                      key={colIndex}
                      className={`w-10 h-10 border border-green-500 transition-all duration-300 ${
                        selectedTile && selectedTile[0] === rowIndex && selectedTile[1] === colIndex
                          ? "border-yellow-400 border-2"
                          : ""
                      }`}
                      style={{ backgroundColor: tile.color }}
                      onClick={() => handleTileClick(rowIndex, colIndex)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {gameOver && (
            <div className="text-center">
              <p className="text-xl mb-4">Game Over! No more matches possible.</p>
              <p className="text-lg mb-4">Total Moves: {moves}</p>
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
        <p>Click two adjacent tiles to swap them. Match 3 or more of the same color to clear them.</p>
      </div>
    </div>
  )
}

