"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

type Choice = "rock" | "paper" | "scissors"
type GameResult = "win" | "lose" | "draw" | null

export default function RockPaperScissors() {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null)
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null)
  const [result, setResult] = useState<GameResult>(null)
  const [score, setScore] = useState({ player: 0, computer: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const choices: Choice[] = ["rock", "paper", "scissors"]

  const getComputerChoice = (): Choice => {
    const randomIndex = Math.floor(Math.random() * 3)
    return choices[randomIndex]
  }

  const determineWinner = (player: Choice, computer: Choice): GameResult => {
    if (player === computer) return "draw"
    if (
      (player === "rock" && computer === "scissors") ||
      (player === "paper" && computer === "rock") ||
      (player === "scissors" && computer === "paper")
    ) {
      return "win"
    }
    return "lose"
  }

  const playGame = (playerSelection: Choice) => {
    const computerSelection = getComputerChoice()
    setPlayerChoice(playerSelection)
    setComputerChoice(computerSelection)
    const gameResult = determineWinner(playerSelection, computerSelection)
    setResult(gameResult)
    if (gameResult === "win") {
      setScore((prev) => ({ ...prev, player: prev.player + 1 }))
    } else if (gameResult === "lose") {
      setScore((prev) => ({ ...prev, computer: prev.computer + 1 }))
    }
  }

  const resetGame = () => {
    setPlayerChoice(null)
    setComputerChoice(null)
    setResult(null)
  }

  const getResultMessage = () => {
    if (!result) return ""
    if (result === "draw") return "It's a draw!"
    return result === "win" ? "You win!" : "Computer wins!"
  }

  const renderChoice = (choice: Choice | null) => {
    switch (choice) {
      case "rock":
        return "🪨"
      case "paper":
        return "📄"
      case "scissors":
        return "✂️"
      default:
        return "❓"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Rock Paper Scissors...</p>
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
          <div className="text-xs">games.griffen.codes | Rock Paper Scissors v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="score-board flex justify-between mb-4">
            <div>
              Player: <span className="text-yellow-400">{score.player}</span>
            </div>
            <div>
              Computer: <span className="text-yellow-400">{score.computer}</span>
            </div>
          </div>

          <div className="game-area flex justify-center items-center space-x-8">
            <div className="player-choice text-center">
              <p className="mb-2">Player</p>
              <div className="text-4xl">{renderChoice(playerChoice)}</div>
            </div>
            <div className="vs text-2xl">VS</div>
            <div className="computer-choice text-center">
              <p className="mb-2">Computer</p>
              <div className="text-4xl">{renderChoice(computerChoice)}</div>
            </div>
          </div>

          <div className="result text-center text-xl">{getResultMessage()}</div>

          <div className="controls flex justify-center gap-4 mt-6">
            {choices.map((choice) => (
              <button
                key={choice}
                onClick={() => playGame(choice)}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30 capitalize"
              >
                {choice}
              </button>
            ))}
          </div>

          <div className="reset flex justify-center mt-4">
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
        <p>Use keyboard shortcuts: R (Rock), P (Paper), S (Scissors), N (New Game)</p>
      </div>
    </div>
  )
}

