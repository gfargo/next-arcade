"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

// Sudoku Lite: 6x6 grid with numbers 1-6
const GRID_SIZE = 6
const BOX_SIZE = 2

type Cell = {
  value: number | null
  isFixed: boolean
}

const generateSudoku = (): Cell[][] => {
  const grid: Cell[][] = Array(GRID_SIZE)
    .fill(null)
    .map(() =>
      Array(GRID_SIZE)
        .fill(null)
        .map(() => ({ value: null, isFixed: false })),
    )

  // Helper function to check if a number is valid in a given position
  const isValid = (row: number, col: number, num: number): boolean => {
    // Check row and column
    for (let i = 0; i < GRID_SIZE; i++) {
      if (grid[row][i].value === num || grid[i][col].value === num) {
        return false
      }
    }

    // Check box
    const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE
    const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE
    for (let i = 0; i < BOX_SIZE; i++) {
      for (let j = 0; j < BOX_SIZE; j++) {
        if (grid[boxRow + i][boxCol + j].value === num) {
          return false
        }
      }
    }

    return true
  }

  // Helper function to fill the grid recursively
  const fillGrid = (row: number, col: number): boolean => {
    if (col === GRID_SIZE) {
      row++
      col = 0
    }
    if (row === GRID_SIZE) {
      return true
    }

    const nums = [1, 2, 3, 4, 5, 6]
    for (const num of nums.sort(() => Math.random() - 0.5)) {
      if (isValid(row, col, num)) {
        grid[row][col].value = num
        if (fillGrid(row, col + 1)) {
          return true
        }
        grid[row][col].value = null
      }
    }
    return false
  }

  fillGrid(0, 0)

  // Remove some numbers to create the puzzle
  const numToRemove = 20 // Adjust this for difficulty
  for (let i = 0; i < numToRemove; i++) {
    let row, col
    do {
      row = Math.floor(Math.random() * GRID_SIZE)
      col = Math.floor(Math.random() * GRID_SIZE)
    } while (grid[row][col].value === null)
    grid[row][col].value = null
  }

  // Mark the filled cells as fixed
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col].value !== null) {
        grid[row][col].isFixed = true
      }
    }
  }

  return grid
}

export default function SudokuLite() {
  const [grid, setGrid] = useState<Cell[][]>([])
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null)
  const [gameWon, setGameWon] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      startNewGame()
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const startNewGame = () => {
    const newGrid = generateSudoku()
    setGrid(newGrid)
    setSelectedCell(null)
    setGameWon(false)
  }

  const handleCellClick = (row: number, col: number) => {
    if (!grid[row][col].isFixed) {
      setSelectedCell([row, col])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (selectedCell && !gameWon) {
      const [row, col] = selectedCell
      const num = Number.parseInt(e.key)
      if (num >= 1 && num <= 6) {
        const newGrid = [...grid]
        newGrid[row][col].value = num
        setGrid(newGrid)
        checkWinCondition(newGrid)
      } else if (e.key === "Backspace" || e.key === "Delete") {
        const newGrid = [...grid]
        newGrid[row][col].value = null
        setGrid(newGrid)
      }
    }
  }

  const checkWinCondition = (currentGrid: Cell[][]) => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (currentGrid[row][col].value === null) {
          return // Not all cells are filled
        }
      }
    }

    // Check rows, columns, and boxes
    for (let i = 0; i < GRID_SIZE; i++) {
      if (
        !isValidSet(currentGrid[i].map((cell) => cell.value)) ||
        !isValidSet(currentGrid.map((row) => row[i].value)) ||
        !isValidBox(currentGrid, i)
      ) {
        return
      }
    }

    setGameWon(true)
  }

  const isValidSet = (set: (number | null)[]): boolean => {
    const numbers = set.filter((num) => num !== null) as number[]
    return new Set(numbers).size === GRID_SIZE
  }

  const isValidBox = (currentGrid: Cell[][], boxIndex: number): boolean => {
    const boxRow = Math.floor(boxIndex / BOX_SIZE) * BOX_SIZE
    const boxCol = (boxIndex % BOX_SIZE) * BOX_SIZE
    const numbers: number[] = []
    for (let i = 0; i < BOX_SIZE; i++) {
      for (let j = 0; j < BOX_SIZE; j++) {
        const value = currentGrid[boxRow + i][boxCol + j].value
        if (value !== null) {
          numbers.push(value)
        }
      }
    }
    return new Set(numbers).size === GRID_SIZE
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Sudoku Lite...</p>
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
          <div className="text-xs">games.griffen.codes | Sudoku Lite v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Sudoku Lite</p>
            <p className="text-sm">Fill the 6x6 grid with numbers 1-6</p>
          </div>

          <div className="grid grid-cols-6 gap-1 max-w-[360px] mx-auto" tabIndex={0} onKeyDown={handleKeyPress}>
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-14 h-14 border border-green-500 flex items-center justify-center text-2xl cursor-pointer
                    ${cell.isFixed ? "bg-green-900 bg-opacity-30" : "hover:bg-green-900 hover:bg-opacity-30"}
                    ${selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex ? "bg-green-700 bg-opacity-50" : ""}
                  `}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell.value}
                </div>
              )),
            )}
          </div>

          {gameWon && (
            <div className="text-center">
              <p className="text-xl mb-4">Congratulations! You solved the puzzle!</p>
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
        <p>Click a cell to select it, then use number keys 1-6 to fill in values. Use Backspace to clear a cell.</p>
      </div>
    </div>
  )
}

