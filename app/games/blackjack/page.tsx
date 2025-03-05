"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

type Card = {
  suit: string
  value: string
  numValue: number
}

type GameState = "betting" | "playing" | "dealerTurn" | "gameOver"

export default function BlackjackGame() {
  const [deck, setDeck] = useState<Card[]>([])
  const [playerHand, setPlayerHand] = useState<Card[]>([])
  const [dealerHand, setDealerHand] = useState<Card[]>([])
  const [gameState, setGameState] = useState<GameState>("betting")
  const [playerScore, setPlayerScore] = useState(0)
  const [dealerScore, setDealerScore] = useState(0)
  const [message, setMessage] = useState("")
  const [chips, setChips] = useState(100)
  const [currentBet, setCurrentBet] = useState(0)
  const [loading, setLoading] = useState(true)

  // Initialize the game
  useEffect(() => {
    initializeGame()
    // Simulate loading for terminal effect
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const initializeGame = () => {
    const newDeck = createDeck()
    setDeck(newDeck)
    setPlayerHand([])
    setDealerHand([])
    setGameState("betting")
    setMessage("Place your bet to start the game.")
    setPlayerScore(0)
    setDealerScore(0)
    setCurrentBet(0)
  }

  const createDeck = (): Card[] => {
    const suits = ["♠", "♥", "♦", "♣"]
    const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]
    const deck: Card[] = []

    for (const suit of suits) {
      for (const value of values) {
        let numValue = 0
        if (value === "A") {
          numValue = 11
        } else if (["J", "Q", "K"].includes(value)) {
          numValue = 10
        } else {
          numValue = Number.parseInt(value)
        }
        deck.push({ suit, value, numValue })
      }
    }

    // Shuffle the deck
    return shuffleDeck(deck)
  }

  const shuffleDeck = (deck: Card[]): Card[] => {
    const newDeck = [...deck]
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]]
    }
    return newDeck
  }

  const placeBet = (amount: number) => {
    if (amount > chips) {
      setMessage("Not enough chips!")
      return
    }

    setCurrentBet(amount)
    setChips(chips - amount)
    startGame()
  }

  const startGame = () => {
    if (deck.length < 10) {
      const newDeck = createDeck()
      setDeck(newDeck)
    }

    const newDeck = [...deck]
    const newPlayerHand: Card[] = [drawCard(newDeck), drawCard(newDeck)]
    const newDealerHand: Card[] = [drawCard(newDeck), drawCard(newDeck)]

    setDeck(newDeck)
    setPlayerHand(newPlayerHand)
    setDealerHand(newDealerHand)
    setGameState("playing")

    const pScore = calculateScore(newPlayerHand)
    const dScore = calculateScore([newDealerHand[0]])

    setPlayerScore(pScore)
    setDealerScore(dScore)

    if (pScore === 21) {
      dealerTurn(newPlayerHand, newDealerHand, newDeck)
    } else {
      setMessage("Hit or Stand?")
    }
  }

  const drawCard = (deckToDrawFrom: Card[]): Card => {
    return deckToDrawFrom.pop()!
  }

  const calculateScore = (hand: Card[]): number => {
    let score = 0
    let aces = 0

    for (const card of hand) {
      score += card.numValue
      if (card.value === "A") {
        aces += 1
      }
    }

    // Adjust for aces
    while (score > 21 && aces > 0) {
      score -= 10
      aces -= 1
    }

    return score
  }

  const hit = () => {
    if (gameState !== "playing") return

    const newDeck = [...deck]
    const newPlayerHand = [...playerHand, drawCard(newDeck)]
    setDeck(newDeck)
    setPlayerHand(newPlayerHand)

    const newScore = calculateScore(newPlayerHand)
    setPlayerScore(newScore)

    if (newScore > 21) {
      setMessage("Bust! You lose.")
      setGameState("gameOver")
    } else if (newScore === 21) {
      stand()
    }
  }

  const stand = () => {
    if (gameState !== "playing") return
    dealerTurn(playerHand, dealerHand, deck)
  }

  const dealerTurn = (pHand: Card[], dHand: Card[], currentDeck: Card[]) => {
    setGameState("dealerTurn")

    const newDealerHand = [...dHand]
    const newDeck = [...currentDeck]
    let dealerScoreValue = calculateScore(newDealerHand)

    // Dealer draws until score is at least 17
    while (dealerScoreValue < 17) {
      const newCard = drawCard(newDeck)
      newDealerHand.push(newCard)
      dealerScoreValue = calculateScore(newDealerHand)
    }

    setDealerHand(newDealerHand)
    setDealerScore(dealerScoreValue)
    setDeck(newDeck)

    // Determine winner
    const playerScoreValue = calculateScore(pHand)

    let result = ""
    let winnings = 0

    if (playerScoreValue > 21) {
      result = "Bust! You lose."
    } else if (dealerScoreValue > 21) {
      result = "Dealer busts! You win!"
      winnings = currentBet * 2
    } else if (playerScoreValue > dealerScoreValue) {
      result = "You win!"
      winnings = currentBet * 2
    } else if (playerScoreValue < dealerScoreValue) {
      result = "Dealer wins."
    } else {
      result = "Push. Bet returned."
      winnings = currentBet
    }

    setMessage(result)
    setChips(chips + winnings)
    setGameState("gameOver")
  }

  const renderCard = (card: Card) => {
    const color = card.suit === "♥" || card.suit === "♦" ? "text-red-500" : "text-white"
    return (
      <div className={`inline-block mr-2 ${color}`}>
        {card.value}
        {card.suit}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Blackjack...</p>
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
          <div className="text-xs">games.griffen.codes | Blackjack v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info flex justify-between">
            <div>
              Chips: <span className="text-yellow-400">${chips}</span>
            </div>
            {currentBet > 0 && (
              <div>
                Bet: <span className="text-yellow-400">${currentBet}</span>
              </div>
            )}
          </div>

          {gameState === "betting" ? (
            <div className="betting-ui space-y-4">
              <h2 className="text-lg">Place your bet:</h2>
              <div className="flex gap-2 flex-wrap">
                {[5, 10, 25, 50].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => placeBet(amount)}
                    disabled={amount > chips}
                    className="px-3 py-1 border border-green-500 hover:bg-green-900 hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="dealer-area">
                <h2 className="text-lg border-b border-green-500 pb-1 mb-2">
                  Dealer: {gameState === "dealerTurn" || gameState === "gameOver" ? dealerScore : "?"}
                </h2>
                <div className="dealer-cards">
                  {dealerHand.map((card, index) => (
                    <span key={index}>
                      {index === 0 || gameState === "dealerTurn" || gameState === "gameOver" ? (
                        renderCard(card)
                      ) : (
                        <span className="inline-block mr-2">🂠</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div className="player-area mt-8">
                <h2 className="text-lg border-b border-green-500 pb-1 mb-2">Player: {playerScore}</h2>
                <div className="player-cards">
                  {playerHand.map((card, index) => (
                    <span key={index}>{renderCard(card)}</span>
                  ))}
                </div>
              </div>

              <div className="message-area mt-4 h-6">
                <p className="text-center">{message}</p>
              </div>

              <div className="controls flex justify-center gap-4 mt-4">
                {gameState === "playing" && (
                  <>
                    <button
                      onClick={hit}
                      className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
                    >
                      Hit
                    </button>
                    <button
                      onClick={stand}
                      className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
                    >
                      Stand
                    </button>
                  </>
                )}

                {gameState === "gameOver" && (
                  <button
                    onClick={initializeGame}
                    className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30 flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    New Game
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-center text-green-700">
        <p>Use keyboard shortcuts: H (Hit), S (Stand), N (New Game)</p>
      </div>
    </div>
  )
}

