"use client"

import { useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

type EmojiEquation = {
  emoji1: string
  emoji2: string
  operation: "+" | "-" | "*"
  result: number
  question: string
}

const EMOJIS = ["😃", "🤔", "😎", "🥳", "🤯", "🤠", "🥸", "🤓", "😇", "🤩"]
const OPERATIONS = ["+", "-", "*"]

const generateEquation = (): EmojiEquation => {
  const emoji1 = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
  const emoji2 = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
  const operation = OPERATIONS[Math.floor(Math.random() * OPERATIONS.length)] as "+" | "-" | "*"
  const value1 = Math.floor(Math.random() * 5) + 1
  const value2 = Math.floor(Math.random() * 5) + 1
  let result: number

  switch (operation) {
    case "+":
      result = value1 + value2
      break
    case "-":
      result = Math.max(value1, value2) - Math.min(value1, value2)
      break
    case "*":
      result = value1 * value2
      break
  }

  const question = Math.random() < 0.5 ? emoji1 : emoji2

  return { emoji1, emoji2, operation, result, question }
}

export default function EmojiEquation() {
  const [equation, setEquation] = useState<EmojiEquation>(generateEquation())
  const [userAnswer, setUserAnswer] = useState<string>("")
  const [feedback, setFeedback] = useState<string>("")
  const [score, setScore] = useState<number>(0)
  const [highScore, setHighScore] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const generateNewEquation = useCallback(() => {
    setEquation(generateEquation())
    setUserAnswer("")
    setFeedback("")
  }, [])

  const checkAnswer = useCallback(() => {
    const correctAnswer =
      equation.question === equation.emoji1
        ? equation.result
        : equation.operation === "*"
          ? Math.floor(equation.result / Number(userAnswer))
          : equation.operation === "+"
            ? equation.result - Number(userAnswer)
            : Number(userAnswer) - equation.result

    if (Number(userAnswer) === correctAnswer) {
      setFeedback("Correct! 🎉")
      setScore((prevScore) => {
        const newScore = prevScore + 1
        if (newScore > highScore) {
          setHighScore(newScore)
          localStorage.setItem("emojiEquationHighScore", newScore.toString())
        }
        return newScore
      })
      generateNewEquation()
    } else {
      setFeedback("Try again! 🤔")
      setScore(0)
    }
  }, [equation, userAnswer, generateNewEquation, highScore])

  useEffect(() => {
    const savedHighScore = localStorage.getItem("emojiEquationHighScore")
    if (savedHighScore) {
      setHighScore(Number(savedHighScore))
    }
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Emoji Equation...</p>
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
          <div className="text-xs">games.griffen.codes | Emoji Equation v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <h1 className="text-3xl font-bold mb-2">Emoji Equation 😃➕🤔</h1>
            <p className="text-sm mb-4">
              Solve the equation using emojis. Each emoji represents a number between 1 and 5.
            </p>
          </div>

          <div className="equation text-center text-2xl mb-4">
            <p>
              {equation.emoji1} {equation.operation} {equation.emoji2} = {equation.result}
            </p>
            <p className="mt-2">{equation.question} = ?</p>
          </div>

          <div className="flex justify-center items-center gap-4">
            <input
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="bg-black border border-green-500 text-green-500 px-2 py-1 w-20 text-center"
              placeholder="?"
            />
            <Button
              onClick={checkAnswer}
              className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
            >
              Submit
            </Button>
          </div>

          <div className="feedback text-center text-xl">{feedback}</div>

          <div className="score text-center">
            <p>
              Score: {score} | High Score: {highScore}
            </p>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={generateNewEquation}
              className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New Equation
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-center text-green-700">
        <p>Solve the equation using emojis. Each emoji represents a number between 1 and 5.</p>
      </div>
    </div>
  )
}

