"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

const GAME_WIDTH = 600
const GAME_HEIGHT = 400
const PLAYER_WIDTH = 40
const PLAYER_HEIGHT = 20
const ALIEN_WIDTH = 30
const ALIEN_HEIGHT = 30
const PROJECTILE_WIDTH = 4
const PROJECTILE_HEIGHT = 10
const ALIEN_ROWS = 4
const ALIEN_COLS = 8

type Entity = {
  x: number
  y: number
  width: number
  height: number
}

type Alien = Entity & {
  alive: boolean
}

export default function SpaceInvaders() {
  const [player, setPlayer] = useState<Entity>({
    x: GAME_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: GAME_HEIGHT - PLAYER_HEIGHT - 10,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
  })
  const [aliens, setAliens] = useState<Alien[]>([])
  const [projectiles, setProjectiles] = useState<Entity[]>([])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [loading, setLoading] = useState(true)

  const initializeGame = useCallback(() => {
    const newAliens: Alien[] = []
    for (let row = 0; row < ALIEN_ROWS; row++) {
      for (let col = 0; col < ALIEN_COLS; col++) {
        newAliens.push({
          x: col * (ALIEN_WIDTH + 20) + 50,
          y: row * (ALIEN_HEIGHT + 20) + 50,
          width: ALIEN_WIDTH,
          height: ALIEN_HEIGHT,
          alive: true,
        })
      }
    }
    setAliens(newAliens)
    setProjectiles([])
    setScore(0)
    setGameOver(false)
    setGameStarted(true)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setPlayer((prev) => ({ ...prev, x: Math.max(0, prev.x - 10) }))
      } else if (e.key === "ArrowRight") {
        setPlayer((prev) => ({ ...prev, x: Math.min(GAME_WIDTH - PLAYER_WIDTH, prev.x + 10) }))
      } else if (e.key === " ") {
        setProjectiles((prev) => [
          ...prev,
          {
            x: player.x + PLAYER_WIDTH / 2 - PROJECTILE_WIDTH / 2,
            y: player.y,
            width: PROJECTILE_WIDTH,
            height: PROJECTILE_HEIGHT,
          },
        ])
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gameStarted, gameOver, player])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const gameLoop = setInterval(() => {
      // Move aliens
      setAliens((prev) =>
        prev.map((alien) => ({
          ...alien,
          y: alien.y + 0.5,
        })),
      )

      // Move projectiles
      setProjectiles((prev) => prev.filter((p) => p.y > 0).map((p) => ({ ...p, y: p.y - 5 })))

      // Check collisions
      setAliens((prev) =>
        prev.map((alien) => {
          if (!alien.alive) return alien
          const hitByProjectile = projectiles.some(
            (p) =>
              p.x < alien.x + alien.width &&
              p.x + p.width > alien.x &&
              p.y < alien.y + alien.height &&
              p.y + p.height > alien.y,
          )
          if (hitByProjectile) {
            setScore((s) => s + 10)
            return { ...alien, alive: false }
          }
          return alien
        }),
      )

      setProjectiles((prev) =>
        prev.filter(
          (p) =>
            !aliens.some(
              (a) =>
                a.alive && p.x < a.x + a.width && p.x + p.width > a.x && p.y < a.y + a.height && p.y + p.height > a.y,
            ),
        ),
      )

      // Check game over conditions
      if (aliens.some((a) => a.alive && a.y + a.height >= player.y)) {
        setGameOver(true)
      }

      if (aliens.every((a) => !a.alive)) {
        setGameOver(true)
      }
    }, 1000 / 60) // 60 FPS

    return () => clearInterval(gameLoop)
  }, [gameStarted, gameOver, aliens, projectiles, player])

  const renderGame = () => (
    <div className="relative w-[600px] h-[400px] border border-green-500 overflow-hidden">
      {/* Player */}
      <div
        className="absolute bg-green-500"
        style={{ left: player.x, top: player.y, width: player.width, height: player.height }}
      ></div>

      {/* Aliens */}
      {aliens.map(
        (alien, index) =>
          alien.alive && (
            <div key={index} className="absolute text-2xl" style={{ left: alien.x, top: alien.y }}>
              👾
            </div>
          ),
      )}

      {/* Projectiles */}
      {projectiles.map((projectile, index) => (
        <div
          key={index}
          className="absolute bg-red-500"
          style={{ left: projectile.x, top: projectile.y, width: projectile.width, height: projectile.height }}
        ></div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Space Invaders...</p>
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
          <div className="text-xs">games.griffen.codes | Space Invaders v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Space Invaders</p>
            <p className="text-sm">Defend Earth from the alien invasion!</p>
            <p className="text-lg mt-2">Score: {score}</p>
          </div>

          <div className="flex justify-center">
            {gameStarted ? (
              renderGame()
            ) : (
              <button
                onClick={initializeGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
              >
                Start Game
              </button>
            )}
          </div>

          {gameOver && (
            <div className="text-center">
              <p className="text-xl mb-4">Game Over! Your score: {score}</p>
              <button
                onClick={initializeGame}
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
        <p>Use left and right arrow keys to move, spacebar to shoot</p>
      </div>
    </div>
  )
}

