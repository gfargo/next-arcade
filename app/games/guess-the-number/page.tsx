"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

export default function GuessTheNumber() {
  const [loading, setLoading] = useState(true)
  const [targetNumber, setTargetNumber] = useState(0)
  const [guess, setGuess] = useState("")
  const [message, setMessage] = useState("")
  const [attempts, setAttempts] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const maxAttempts = 10

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      startNewGame()
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const startNewGame = () => {
    setTargetNumber(Math.floor(Math.random() * 100) + 1)
    setGuess("")
    setMessage("Guess a number between 1 and 100")
    setAttempts(0)
    setGameOver(false)
  }

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault()
    const guessNumber = Number.parseInt(guess)

    if (isNaN(guessNumber) || guessNumber < 1 || guessNumber > 100) {
      setMessage("Please enter a valid number between 1 and 100")
      return
    }

    const newAttempts = attempts + 1
    setAttempts(newAttempts)

    if (guessNumber === targetNumber) {
      setMessage(`Congratulations! You guessed the number in ${newAttempts} attempts.`)
      setGameOver(true)
    } else if (newAttempts >= maxAttempts) {
      setMessage(`Game over! The number was ${targetNumber}.`)
      setGameOver(true)
    } else if (guessNumber < targetNumber) {
      setMessage("Too low! Try again.")
    } else {
      setMessage("Too high! Try again.")
    }

    setGuess("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Guess the Number...</p>
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
          <div className="text-xs">games.griffen.codes | Guess the Number v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">{message}</p>
            <p>
              Attempts: {attempts}/{maxAttempts}
            </p>
          </div>

          <form onSubmit={handleGuess} className="flex justify-center items-center space-x-4">
            <input
              type="number"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              disabled={gameOver}
              className="bg-black border border-green-500 text-green-500 px-3 py-2 w-24 text-center"
              placeholder="1-100"
              min="1"
              max="100"
            />
            <button
              type="submit"
              disabled={gameOver}
              className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30 disabled:opacity-50"
            >
              Guess
            </button>
          </form>

          {gameOver && (
            <div className="flex justify-center mt-4">
              <button
                onClick={startNewGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                New Game
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-center text-green-700">
        <p>Type a number and press Enter to make a guess</p>
      </div>
    </div>
  )
}

