"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

const GAME_DURATION = 60 // 60 seconds
const WORDS_PER_ROUND = 50 // Number of words in the tag cloud

// Extended word database
const words = [
  "terminal",
  "code",
  "developer",
  "javascript",
  "react",
  "nextjs",
  "typescript",
  "tailwind",
  "css",
  "html",
  "node",
  "express",
  "database",
  "api",
  "frontend",
  "backend",
  "fullstack",
  "git",
  "github",
  "vercel",
  "deployment",
  "server",
  "client",
  "component",
  "function",
  "variable",
  "constant",
  "array",
  "object",
  "string",
  "number",
  "boolean",
  "null",
  "undefined",
  "promise",
  "async",
  "await",
  "loop",
  "condition",
  "statement",
  "class",
  "interface",
  "type",
  "enum",
  "module",
  "import",
  "export",
  "default",
  "props",
  "state",
  "hook",
  "effect",
  "callback",
  "memo",
  "context",
  "reducer",
  "algorithm",
  "data",
  "structure",
  "stack",
  "queue",
  "tree",
  "graph",
  "sort",
  "search",
  "recursion",
  "iteration",
  "optimization",
  "performance",
  "memory",
  "compiler",
  "interpreter",
  "runtime",
  "framework",
  "library",
  "package",
  "dependency",
  "version",
  "control",
  "branch",
  "merge",
  "pull",
  "push",
  "commit",
  "repository",
  "clone",
  "fork",
  "issue",
  "bug",
  "feature",
  "release",
  "production",
  "development",
  "testing",
  "debugging",
  "logging",
  "error",
  "exception",
  "try",
  "catch",
  "finally",
  "throw",
  "asynchronous",
  "synchronous",
  "event",
  "listener",
  "emitter",
  "stream",
  "buffer",
  "file",
  "input",
  "output",
  "network",
  "protocol",
  "http",
  "https",
  "websocket",
  "rest",
  "graphql",
  "authentication",
  "authorization",
  "encryption",
  "decryption",
  "hashing",
  "salt",
  "token",
  "session",
  "cookie",
  "cache",
  "middleware",
  "plugin",
  "extension",
  "api",
  "endpoint",
  "request",
  "response",
  "header",
  "body",
  "parameter",
  "query",
  "validation",
  "sanitization",
  "security",
  "vulnerability",
  "injection",
  "cross-site",
  "scripting",
  "denial",
  "service",
  "firewall",
  "load",
  "balancer",
  "proxy",
  "reverse",
  "cdn",
  "content",
  "delivery",
  "network",
  "cloud",
  "serverless",
  "container",
  "docker",
  "kubernetes",
  "orchestration",
  "microservice",
  "monolith",
  "architecture",
  "design",
  "pattern",
  "solid",
  "principle",
  "dependency",
  "injection",
  "inversion",
  "control",
  "separation",
  "concerns",
  "single",
  "responsibility",
  "open",
  "closed",
  "liskov",
  "substitution",
  "interface",
  "segregation",
  "composition",
  "inheritance",
  "polymorphism",
  "encapsulation",
  "abstraction",
]

export default function TypingSpeedChallenge() {
  const [currentWord, setCurrentWord] = useState("")
  const [userInput, setUserInput] = useState("")
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [wordsTyped, setWordsTyped] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [loading, setLoading] = useState(true)
  const [difficulty, setDifficulty] = useState(1)
  const [wordCloud, setWordCloud] = useState<string[]>([])
  const [completedWords, setCompletedWords] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)

  const totalKeystrokes = useRef(0)
  const correctKeystrokes = useRef(0)

  const getRandomWords = useCallback((count: number) => {
    const shuffled = [...words].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (gameStarted && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer)
            setGameOver(true)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [gameStarted, gameOver])

  const startGame = () => {
    const newWordCloud = getRandomWords(WORDS_PER_ROUND * difficulty)
    setWordCloud(newWordCloud)
    setCurrentWord(newWordCloud[0])
    setUserInput("")
    setGameStarted(true)
    setGameOver(false)
    setTimeLeft(GAME_DURATION)
    setWordsTyped(0)
    setAccuracy(100)
    setCompletedWords(new Set())
    totalKeystrokes.current = 0
    correctKeystrokes.current = 0
    if (inputRef.current) inputRef.current.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setUserInput(inputValue)
    totalKeystrokes.current++

    // Check accuracy
    for (let i = 0; i < inputValue.length; i++) {
      if (inputValue[i] === currentWord[i]) {
        correctKeystrokes.current++
      }
    }

    setAccuracy(Math.round((correctKeystrokes.current / totalKeystrokes.current) * 100))

    if (inputValue === currentWord) {
      setWordsTyped((prev) => prev + 1)
      setCompletedWords((prev) => new Set(prev).add(currentWord))
      const remainingWords = wordCloud.filter((word) => !completedWords.has(word) && word !== currentWord)
      if (remainingWords.length > 0) {
        setCurrentWord(remainingWords[Math.floor(Math.random() * remainingWords.length)])
      } else {
        setGameOver(true)
      }
      setUserInput("")
    }
  }

  const calculateWPM = () => {
    return Math.round((wordsTyped / GAME_DURATION) * 60)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Typing Speed Challenge...</p>
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
          <div className="text-xs">games.griffen.codes | Typing Speed Challenge v1.1</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Typing Speed Challenge</p>
            <p className="text-sm">Type the words as quickly and accurately as possible!</p>
          </div>

          {!gameStarted && !gameOver && (
            <div className="text-center space-y-4">
              <div>
                <label htmlFor="difficulty" className="block mb-2">
                  Difficulty:
                </label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  className="bg-black border border-green-500 text-green-500 px-2 py-1"
                >
                  <option value={1}>Easy</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Hard</option>
                </select>
              </div>
              <button
                onClick={startGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
              >
                Start Game
              </button>
            </div>
          )}

          {(gameStarted || gameOver) && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {wordCloud.map((word, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded text-xs ${
                      completedWords.has(word) ? "bg-green-500 text-black" : "bg-green-900 bg-opacity-30"
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
              <div className="text-center">
                <p className="text-2xl mb-2">{currentWord}</p>
                <input
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  className="w-full max-w-md px-2 py-1 bg-black border border-green-500 text-green-500 text-center"
                  placeholder="Type here..."
                  disabled={gameOver}
                  ref={inputRef}
                />
              </div>
              <div className="flex justify-between max-w-md mx-auto">
                <p>Time: {timeLeft}s</p>
                <p>Words: {wordsTyped}</p>
                <p>Accuracy: {accuracy}%</p>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="text-center space-y-4">
              <p className="text-xl">Game Over!</p>
              <p>Words Per Minute: {calculateWPM()}</p>
              <p>Total Words: {wordsTyped}</p>
              <p>Accuracy: {accuracy}%</p>
              <button
                onClick={startGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30 flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-center text-green-700">
        <p>
          Type the displayed words as quickly and accurately as possible. The game ends when you type all words or time
          runs out.
        </p>
      </div>
    </div>
  )
}

