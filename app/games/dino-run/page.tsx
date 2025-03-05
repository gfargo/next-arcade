"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

const GAME_WIDTH = 600
const GAME_HEIGHT = 200
const DINO_WIDTH = 40
const DINO_HEIGHT = 60
const CACTUS_WIDTH = 20
const CACTUS_HEIGHT = 40
const GROUND_HEIGHT = 20
const JUMP_FORCE = 12
const GRAVITY = 0.6
const INITIAL_SPEED = 5
const SPEED_INCREMENT = 0.001

type GameState = {
  dino: { x: number; y: number; velocityY: number }
  cacti: { x: number }[]
  score: number
  speed: number
}

export default function DinoRun() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState(0)
  const [loading, setLoading] = useState(true)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameStateRef = useRef<GameState>({
    dino: { x: 50, y: GAME_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT, velocityY: 0 },
    cacti: [],
    score: 0,
    speed: INITIAL_SPEED,
  })

  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const resetGame = useCallback(() => {
    gameStateRef.current = {
      dino: { x: 50, y: GAME_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT, velocityY: 0 },
      cacti: [],
      score: 0,
      speed: INITIAL_SPEED,
    }
    setGameOver(false)
  }, [])

  const startGame = useCallback(() => {
    resetGame()
    setGameStarted(true)
  }, [resetGame])

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const gameState = gameStateRef.current

    // Update game state
    gameState.dino.velocityY += GRAVITY
    gameState.dino.y = Math.min(gameState.dino.y + gameState.dino.velocityY, GAME_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT)

    gameState.cacti = gameState.cacti
      .map((cactus) => ({ ...cactus, x: cactus.x - gameState.speed }))
      .filter((cactus) => cactus.x > -CACTUS_WIDTH)

    if (gameState.cacti.length < 3 && Math.random() < 0.02) {
      gameState.cacti.push({ x: GAME_WIDTH })
    }

    const collision = gameState.cacti.some(
      (cactus) =>
        gameState.dino.x < cactus.x + CACTUS_WIDTH &&
        gameState.dino.x + DINO_WIDTH > cactus.x &&
        gameState.dino.y + DINO_HEIGHT > GAME_HEIGHT - GROUND_HEIGHT - CACTUS_HEIGHT,
    )

    if (collision) {
      setGameOver(true)
      setHighScore((prevHighScore) => Math.max(prevHighScore, gameState.score))
      return
    }

    gameState.score++
    gameState.speed += SPEED_INCREMENT

    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Draw ground
    ctx.fillStyle = "#22c55e"
    ctx.fillRect(0, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, GROUND_HEIGHT)

    // Draw dino
    ctx.fillRect(gameState.dino.x, gameState.dino.y, DINO_WIDTH, DINO_HEIGHT)

    // Draw cacti
    gameState.cacti.forEach((cactus) => {
      ctx.fillRect(cactus.x, GAME_HEIGHT - GROUND_HEIGHT - CACTUS_HEIGHT, CACTUS_WIDTH, CACTUS_HEIGHT)
    })

    // Draw score
    ctx.fillStyle = "#22c55e"
    ctx.font = "16px monospace"
    ctx.fillText(`Score: ${gameState.score}`, 10, 20)

    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [])

  useEffect(() => {
    if (gameStarted && !gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameStarted, gameOver, gameLoop])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.code === "Space" && gameStateRef.current.dino.y === GAME_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT) {
      gameStateRef.current.dino.velocityY = -JUMP_FORCE
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Dino Run...</p>
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
          <div className="text-xs">games.griffen.codes | Dino Run v1.1</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Dino Run</p>
            <p className="text-sm">Jump over cacti and survive as long as you can!</p>
            {gameStarted && !gameOver && (
              <p className="text-lg mt-2">
                Score: {gameStateRef.current.score} | High Score: {highScore}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <div tabIndex={0} onKeyDown={handleKeyDown} className="focus:outline-none">
              <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="border border-green-500" />
            </div>
          </div>

          {!gameStarted && (
            <div className="text-center">
              <button
                onClick={startGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
              >
                Start Game
              </button>
            </div>
          )}

          {gameOver && (
            <div className="text-center">
              <p className="text-xl mb-4">Game Over! Your score: {gameStateRef.current.score}</p>
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
        <p>Press Spacebar to jump over the cacti.</p>
      </div>
    </div>
  )
}

