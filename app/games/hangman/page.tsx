"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

// Word list for the game
const WORDS = [
  "TERMINAL",
  "ARCADE",
  "RETRO",
  "COMPUTER",
  "CONSOLE",
  "PIXEL",
  "JOYSTICK",
  "KEYBOARD",
  "COMMAND",
  "BINARY",
  "PROGRAM",
  "GAMING",
  "CLASSIC",
  "VECTOR",
  "SYSTEM",
]

export default function HangmanGame() {
  const [loading, setLoading] = useState(true)
  const [word, setWord] = useState("")
  const [guessedLetters, setGuessedLetters] = useState<string[]>([])
  const [wrongGuesses, setWrongGuesses] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const maxWrongGuesses = 6

  // Initialize the game
  useEffect(() => {
    // Simulate loading for terminal effect
    const timer = setTimeout(() => {
      setLoading(false)
      startNewGame()
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Set up keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || gameWon) {
        if (e.key === "r" || e.key === "R") startNewGame()
        return
      }

      const key = e.key.toUpperCase()
      if (key.length === 1 && key >= "A" && key <= "Z") {
        makeGuess(key)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gameOver, gameWon])

  const startNewGame = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)]
    setWord(randomWord)
    setGuessedLetters([])
    setWrongGuesses(0)
    setGameOver(false)
    setGameWon(false)
  }

  const makeGuess = (letter: string) => {
    if (guessedLetters.includes(letter)) return

    const newGuessedLetters = [...guessedLetters, letter]
    setGuessedLetters(newGuessedLetters)

    if (!word.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1
      setWrongGuesses(newWrongGuesses)

      if (newWrongGuesses >= maxWrongGuesses) {
        setGameOver(true)
      }
    } else {
      // Check if player has won
      const isWon = word.split("").every((char) => newGuessedLetters.includes(char))
      if (isWon) {
        setGameWon(true)
      }
    }
  }

  const renderWord = () => {
    return word.split("").map((letter, index) => (
      <span key={index} className="inline-block mx-1 text-2xl">
        {guessedLetters.includes(letter) ? letter : "_"}
      </span>
    ))
  }

  const renderHangman = () => {
    const hangmanStages = [
      `
  +---+
  |   |
      |
      |
      |
      |
=========`,
      `
  +---+
  |   |
  O   |
      |
      |
      |
=========`,
      `
  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
      `
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
      `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
      `
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
      `
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`,
    ]

    return <pre className="text-green-500 leading-tight">{hangmanStages[wrongGuesses]}</pre>
  }

  const renderKeyboard = () => {
    const keyboard = [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["Z", "X", "C", "V", "B", "N", "M"],
    ]

    return (
      <div className="keyboard mt-4">
        {keyboard.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 my-1">
            {row.map((key) => {
              const isGuessed = guessedLetters.includes(key)
              const isCorrect = word.includes(key) && isGuessed

              return (
                <button
                  key={key}
                  onClick={() => makeGuess(key)}
                  disabled={isGuessed || gameOver || gameWon}
                  className={`w-8 h-8 flex items-center justify-center border ${
                    isGuessed
                      ? isCorrect
                        ? "border-green-600 bg-green-900 bg-opacity-30 text-green-400"
                        : "border-red-600 bg-red-900 bg-opacity-30 text-red-400"
                      : "border-green-500 hover:bg-green-900 hover:bg-opacity-30"
                  } ${isGuessed || gameOver || gameWon ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {key}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex items-center justify-center">
        <div className="terminal-container border border-green-500 rounded-md p-4">
          <div className="text-center">
            <p className="mb-4">Loading Hangman...</p>
            <div className="inline-block w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
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
          <div className="text-xs">games.griffen.codes | Hangman v1.0</div>
        </div>

        <div className="game-container">
          <div className="game-status text-center mb-4">
            {gameOver ? (
              <div className="text-red-500 text-xl">Game Over! The word was: {word}</div>
            ) : gameWon ? (
              <div className="text-yellow-400 text-xl">You Won!</div>
            ) : (
              <div>
                Guesses remaining: <span className="text-yellow-400">{maxWrongGuesses - wrongGuesses}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="hangman-display">{renderHangman()}</div>

            <div className="word-display text-center">
              <div className="mb-4">{renderWord()}</div>
              {renderKeyboard()}
            </div>
          </div>

          {(gameOver || gameWon) && (
            <div className="flex justify-center mt-6">
              <button
                onClick={startNewGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Play Again
              </button>
            </div>
          )}

          <div className="instructions mt-6 text-sm text-green-700">
            <p className="text-center">Type letters on your keyboard to guess</p>
            <p className="text-center">Press R to start a new game</p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-center text-green-700">
        <p>Classic Hangman Game - Terminal Edition</p>
      </div>
    </div>
  )
}

