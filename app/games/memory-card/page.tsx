"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

type Card = {
  id: number
  content: string
  flipped: boolean
  matched: boolean
}

export default function MemoryCard() {
  const [loading, setLoading] = useState(true)
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
      startNewGame()
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const startNewGame = () => {
    const emojis = ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼"]
    const shuffledCards = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((content, index) => ({
        id: index,
        content,
        flipped: false,
        matched: false,
      }))
    setCards(shuffledCards)
    setFlippedCards([])
    setMoves(0)
    setGameOver(false)
  }

  const handleCardClick = (id: number) => {
    if (flippedCards.length === 2 || cards[id].flipped || cards[id].matched) return

    const newCards = [...cards]
    newCards[id].flipped = true
    setCards(newCards)

    const newFlippedCards = [...flippedCards, id]
    setFlippedCards(newFlippedCards)

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1)
      const [firstId, secondId] = newFlippedCards
      if (cards[firstId].content === cards[secondId].content) {
        newCards[firstId].matched = true
        newCards[secondId].matched = true
        setCards(newCards)
        setFlippedCards([])
        checkGameOver(newCards)
      } else {
        setTimeout(() => {
          newCards[firstId].flipped = false
          newCards[secondId].flipped = false
          setCards(newCards)
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  const checkGameOver = (cards: Card[]) => {
    if (cards.every((card) => card.matched)) {
      setGameOver(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Memory Card...</p>
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
          <div className="text-xs">games.griffen.codes | Memory Card v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Memory Card Game</p>
            <p>Moves: {moves}</p>
          </div>

          <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                className={`w-16 h-16 flex items-center justify-center text-2xl border ${
                  card.flipped || card.matched
                    ? "bg-green-900 border-green-500"
                    : "bg-black border-green-500 hover:bg-green-900 hover:bg-opacity-30"
                } transition-colors duration-300`}
                disabled={card.flipped || card.matched}
              >
                {card.flipped || card.matched ? card.content : "?"}
              </button>
            ))}
          </div>

          {gameOver && (
            <div className="text-center">
              <p className="text-xl mb-4">Congratulations! You won in {moves} moves.</p>
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
        <p>Click on cards to flip them and find matching pairs</p>
      </div>
    </div>
  )
}

