"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { RefreshCw } from "lucide-react"
import ReactDOMServer from "react-dom/server"

const GAME_WIDTH = 600
const GAME_HEIGHT = 200
const PLAYER_WIDTH = 40
const PLAYER_HEIGHT = 60
const OBSTACLE_WIDTH = 20
const OBSTACLE_HEIGHT = 40
const GROUND_HEIGHT = 20
const JUMP_FORCE = 12
const GRAVITY = 0.6
const INITIAL_SPEED = 5
const SPEED_INCREMENT = 0.001

type GameState = {
  player: { x: number; y: number; velocityY: number }
  obstacles: { x: number }[]
  score: number
  speed: number
}

const PlayerSVG = () => (
  <svg width={PLAYER_WIDTH} height={PLAYER_HEIGHT} viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="60" fill="#22c55e" />
    <rect x="5" y="10" width="10" height="10" fill="black" />
    <rect x="30" y="30" width="10" height="20" fill="black" />
  </svg>
)

const ObstacleSVG = () => (
  <svg
    width={OBSTACLE_WIDTH}
    height={OBSTACLE_HEIGHT}
    viewBox="0 0 20 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10 0L20 40H0L10 0Z" fill="#22c55e" />
  </svg>
)

export default function PixelHopperGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameStateRef = useRef<GameState>({
    player: { x: 50, y: GAME_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT, velocityY: 0 },
    obstacles: [],
    score: 0,
    speed: INITIAL_SPEED,
  })

  const animationFrameRef = useRef<number>()

  const resetGame = useCallback(() => {
    gameStateRef.current = {
      player: { x: 50, y: GAME_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT, velocityY: 0 },
      obstacles: [],
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
    gameState.player.velocityY += GRAVITY
    gameState.player.y = Math.min(
      gameState.player.y + gameState.player.velocityY,
      GAME_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT,
    )

    gameState.obstacles = gameState.obstacles
      .map((obstacle) => ({ ...obstacle, x: obstacle.x - gameState.speed }))
      .filter((obstacle) => obstacle.x > -OBSTACLE_WIDTH)

    if (gameState.obstacles.length < 3 && Math.random() < 0.02) {
      gameState.obstacles.push({ x: GAME_WIDTH })
    }

    const collision = gameState.obstacles.some(
      (obstacle) =>
        gameState.player.x < obstacle.x + OBSTACLE_WIDTH &&
        gameState.player.x + PLAYER_WIDTH > obstacle.x &&
        gameState.player.y + PLAYER_HEIGHT > GAME_HEIGHT - GROUND_HEIGHT - OBSTACLE_HEIGHT,
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

    // Draw player
    ctx.drawImage(renderSVGToImage(PlayerSVG), gameState.player.x, gameState.player.y)

    // Draw obstacles
    gameState.obstacles.forEach((obstacle) => {
      ctx.drawImage(renderSVGToImage(ObstacleSVG), obstacle.x, GAME_HEIGHT - GROUND_HEIGHT - OBSTACLE_HEIGHT)
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
    if (event.code === "Space" && gameStateRef.current.player.y === GAME_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT) {
      gameStateRef.current.player.velocityY = -JUMP_FORCE
    }
  }, [])

  const renderSVGToImage = (SvgComponent: React.FC): HTMLImageElement => {
    const svgString = encodeURIComponent(ReactDOMServer.renderToString(<SvgComponent />))
    const img = new Image()
    img.src = `data:image/svg+xml,${svgString}`
    return img
  }

  return (
    <div className="game-container space-y-6">
      <div className="game-info text-center">
        <p className="text-xl mb-2">Pixel Hopper</p>
        <p className="text-sm">Jump over obstacles and survive as long as you can!</p>
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
  )
}

