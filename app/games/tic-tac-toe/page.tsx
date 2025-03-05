"use client"

import { ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

type Player = "X" | "O" | null

export default function TicTacToe() {
  const [loading, setLoading] = useState(true)
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X")
  const [winner, setWinner] = useState<Player>(null)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const checkWinner = (squares: Player[]): Player => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i]
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a]
      }
    }

    return null
  }

  const handleClick = (index: number) => {
    if (board[index] || winner) return

    const newBoard = [...board]
    newBoard[index] = currentPlayer
    setBoard(newBoard)

    const newWinner = checkWinner(newBoard)
    if (newWinner) {
      setWinner(newWinner)
      setGameOver(true)
    } else if (newBoard.every((square) => square !== null)) {
      setGameOver(true)
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X")
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer("X")
    setWinner(null)
    setGameOver(false)
  }

  const renderSquare = (index: number) => (
    <button
      className={`w-16 h-16 border border-green-500 flex items-center justify-center text-2xl ${
        board[index] ? "bg-green-900 bg-opacity-30" : "hover:bg-green-900 hover:bg-opacity-30"
      }`}
      onClick={() => handleClick(index)}
      disabled={!!board[index] || !!winner}
    >
      {board[index]}
    </button>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Tic-Tac-Toe...</p>
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
          <div className="text-xs">games.griffen.codes | Tic-Tac-Toe v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Tic-Tac-Toe</p>
            {!gameOver && <p>Current player: {currentPlayer}</p>}
            {winner && <p className="text-yellow-400">Winner: {winner}</p>}
            {gameOver && !winner && <p className="text-yellow-400">It&apos;s a draw!</p>}
          </div>

          <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
            {Array(9)
              .fill(null)
              .map((_, index) => (
                <div key={index}>{renderSquare(index)}</div>
              ))}
          </div>

          <div className="flex justify-center mt-4">
            <button
              onClick={resetGame}
              className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              New Game
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-center text-green-700">
        <p>Click on a square to make your move</p>
      </div>
    </div>
  )
}

