"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

const GRID_SIZE = 10
const NUM_MINES = 15

type Cell = {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborMines: number
}

export default function Minesweeper() {
  const [loading, setLoading] = useState(true)
  const [grid, setGrid] = useState<Cell[][]>([])
  const [gameOver, setGameOver] = useState(false)
  const [win, setWin] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      startNewGame()
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const startNewGame = () => {
    const newGrid = createGrid()
    setGrid(newGrid)
    setGameOver(false)
    setWin(false)
  }

  const createGrid = (): Cell[][] => {
    const newGrid: Cell[][] = Array(GRID_SIZE)
      .fill(null)
      .map(() =>
        Array(GRID_SIZE)
          .fill(null)
          .map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborMines: 0,
          })),
      )

    // Place mines
    let minesPlaced = 0
    while (minesPlaced < NUM_MINES) {
      const row = Math.floor(Math.random() * GRID_SIZE)
      const col = Math.floor(Math.random() * GRID_SIZE)
      if (!newGrid[row][col].isMine) {
        newGrid[row][col].isMine = true
        minesPlaced++
      }
    }

    // Calculate neighbor mines
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!newGrid[row][col].isMine) {
          newGrid[row][col].neighborMines = countNeighborMines(newGrid, row, col)
        }
      }
    }

    return newGrid
  }

  const countNeighborMines = (grid: Cell[][], row: number, col: number): number => {
    let count = 0
    for (let r = Math.max(0, row - 1); r <= Math.min(GRID_SIZE - 1, row + 1); r++) {
      for (let c = Math.max(0, col - 1); c <= Math.min(GRID_SIZE - 1, col + 1); c++) {
        if (grid[r][c].isMine) count++
      }
    }
    return count
  }

  const handleCellClick = (row: number, col: number) => {
    if (gameOver || win || grid[row][col].isRevealed || grid[row][col].isFlagged) return

    const newGrid = [...grid]
    if (newGrid[row][col].isMine) {
      // Game over
      revealAllMines(newGrid)
      setGameOver(true)
    } else {
      revealCell(newGrid, row, col)
      if (checkWin(newGrid)) {
        setWin(true)
      }
    }
    setGrid(newGrid)
  }

  const handleCellRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault()
    if (gameOver || win || grid[row][col].isRevealed) return

    const newGrid = [...grid]
    newGrid[row][col].isFlagged = !newGrid[row][col].isFlagged
    setGrid(newGrid)
  }

  const revealCell = (grid: Cell[][], row: number, col: number) => {
    if (
      row < 0 ||
      row >= GRID_SIZE ||
      col < 0 ||
      col >= GRID_SIZE ||
      grid[row][col].isRevealed ||
      grid[row][col].isFlagged
    )
      return

    grid[row][col].isRevealed = true

    if (grid[row][col].neighborMines === 0) {
      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          revealCell(grid, r, c)
        }
      }
    }
  }

  const revealAllMines = (grid: Cell[][]) => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col].isMine) {
          grid[row][col].isRevealed = true
        }
      }
    }
  }

  const checkWin = (grid: Cell[][]): boolean => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (!grid[row][col].isMine && !grid[row][col].isRevealed) {
          return false
        }
      }
    }
    return true
  }

  const renderCell = (cell: Cell) => {
    if (cell.isFlagged) return "🚩"
    if (!cell.isRevealed) return "■"
    if (cell.isMine) return "💣"
    return cell.neighborMines === 0 ? " " : cell.neighborMines.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Minesweeper...</p>
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
          <div className="text-xs">games.griffen.codes | Minesweeper v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Minesweeper</p>
            <p className="text-sm">Clear the board without hitting any mines!</p>
          </div>

          <div className="grid-container flex justify-center">
            <div className="inline-block border border-green-500">
              {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => (
                    <button
                      key={colIndex}
                      className={`w-6 h-6 flex items-center justify-center border border-green-500 ${
                        cell.isRevealed ? "bg-green-900 bg-opacity-30" : "hover:bg-green-900 hover:bg-opacity-30"
                      }`}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
                      disabled={gameOver || win}
                    >
                      {renderCell(cell)}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {(gameOver || win) && (
            <div className="text-center">
              <p className="text-xl mb-4">{win ? "Congratulations! You won!" : "Game Over! You hit a mine!"}</p>
              <button
                onClick={startNewGame}
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
        <p>Left-click to reveal a cell, right-click to flag/unflag a mine</p>
      </div>
    </div>
  )
}

