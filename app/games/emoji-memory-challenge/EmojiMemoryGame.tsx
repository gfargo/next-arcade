"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"

const EMOJIS = ["😃", "😎", "🤔", "🤯", "🥳", "😴", "🤠", "🤡", "👽", "🤖", "👻", "💀", "👾", "🐱"]
const INITIAL_SEQUENCE_LENGTH = 3
const SEQUENCE_DISPLAY_TIME = 1000
const LEVEL_UP_THRESHOLD = 3

type Props = {
  onGameOver: (score: number) => void
  onScoreUpdate: (score: number) => void
}

export default function EmojiMemoryGame({ onGameOver, onScoreUpdate }: Props) {
  const [sequence, setSequence] = useState<string[]>([])
  const [playerSequence, setPlayerSequence] = useState<string[]>([])
  const [showSequence, setShowSequence] = useState(false)
  const [level, setLevel] = useState(1)
  const [score, setScore] = useState(0)
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0)

  const generateSequence = useCallback(() => {
    const newSequence = Array.from(
      { length: INITIAL_SEQUENCE_LENGTH + level - 1 },
      () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    )
    setSequence(newSequence)
    setShowSequence(true)
    setTimeout(() => {
      setShowSequence(false)
    }, SEQUENCE_DISPLAY_TIME * level)
  }, [level])

  useEffect(() => {
    generateSequence()
  }, [generateSequence])

  const handleEmojiClick = (emoji: string) => {
    if (showSequence) return

    const newPlayerSequence = [...playerSequence, emoji]
    setPlayerSequence(newPlayerSequence)

    if (newPlayerSequence[newPlayerSequence.length - 1] !== sequence[newPlayerSequence.length - 1]) {
      playSound("incorrect")
      onGameOver(score)
    } else {
      playSound("correct")
      if (newPlayerSequence.length === sequence.length) {
        const newScore = score + level * 10
        setScore(newScore)
        onScoreUpdate(newScore)
        setConsecutiveCorrect(consecutiveCorrect + 1)

        if (consecutiveCorrect + 1 >= LEVEL_UP_THRESHOLD) {
          setLevel(level + 1)
          setConsecutiveCorrect(0)
        }

        setPlayerSequence([])
        generateSequence()
      }
    }
  }

  const playSound = (type: "correct" | "incorrect") => {
    const audio = new Audio(type === "correct" ? "/sounds/correct.mp3" : "/sounds/incorrect.mp3")
    audio.play()
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-2xl mb-4">
        {showSequence
          ? sequence.join(" ")
          : playerSequence.map((emoji, index) => (sequence[index] === emoji ? emoji : "❌")).join(" ")}
      </div>
      <div className="grid grid-cols-5 gap-2">
        {EMOJIS.map((emoji) => (
          <Button
            key={emoji}
            onClick={() => handleEmojiClick(emoji)}
            className="w-12 h-12 text-2xl bg-green-900 bg-opacity-30 border border-green-500 hover:bg-green-700 hover:bg-opacity-50"
            disabled={showSequence}
          >
            {emoji}
          </Button>
        ))}
      </div>
      <div className="mt-4">
        <p>Level: {level}</p>
        <p>Score: {score}</p>
      </div>
    </div>
  )
}

