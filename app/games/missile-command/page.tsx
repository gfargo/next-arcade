"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

const GAME_WIDTH = 600
const GAME_HEIGHT = 400
const CITY_WIDTH = 40
const CITY_HEIGHT = 20
const MISSILE_SPEED = 1
const INTERCEPTOR_SPEED = 2

type Missile = {
  x: number
  y: number
  targetX: number
}

type Interceptor = {
  x: number
  y: number
  targetX: number
  targetY: number
}

type Explosion = {
  x: number
  y: number
  radius: number
  maxRadius: number
}

export default function MissileCommand() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [cities, setCities] = useState<boolean[]>([true, true, true, true, true, true])
  const [missiles, setMissiles] = useState<Missile[]>([])
  const [interceptors, setInterceptors] = useState<Interceptor[]>([])
  const [explosions, setExplosions] = useState<Explosion[]>([])
  const [level, setLevel] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const gameLoop = setInterval(() => {
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

      // Draw cities
      cities.forEach((alive, index) => {
        if (alive) {
          ctx.fillStyle = "#22c55e"
          ctx.fillRect(index * 100 + 30, GAME_HEIGHT - CITY_HEIGHT, CITY_WIDTH, CITY_HEIGHT)
        }
      })

      // Update and draw missiles
      setMissiles((prevMissiles) =>
        prevMissiles
          .map((missile) => ({
            ...missile,
            y: missile.y + MISSILE_SPEED,
          }))
          .filter((missile) => missile.y < GAME_HEIGHT),
      )

      missiles.forEach((missile) => {
        ctx.strokeStyle = "#ef4444"
        ctx.beginPath()
        ctx.moveTo(missile.x, 0)
        ctx.lineTo(missile.x, missile.y)
        ctx.stroke()
      })

      // Update and draw interceptors
      setInterceptors(
        (prevInterceptors) =>
          prevInterceptors
            .map((interceptor) => {
              const dx = interceptor.targetX - interceptor.x
              const dy = interceptor.targetY - interceptor.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              if (distance < INTERCEPTOR_SPEED) {
                setExplosions((prevExplosions) => [
                  ...prevExplosions,
                  { x: interceptor.targetX, y: interceptor.targetY, radius: 0, maxRadius: 30 },
                ])
                return null
              }
              const vx = (dx / distance) * INTERCEPTOR_SPEED
              const vy = (dy / distance) * INTERCEPTOR_SPEED
              return {
                ...interceptor,
                x: interceptor.x + vx,
                y: interceptor.y + vy,
              }
            })
            .filter(Boolean) as Interceptor[],
      )

      interceptors.forEach((interceptor) => {
        ctx.strokeStyle = "#22c55e"
        ctx.beginPath()
        ctx.moveTo(GAME_WIDTH / 2, GAME_HEIGHT)
        ctx.lineTo(interceptor.x, interceptor.y)
        ctx.stroke()
      })

      // Update and draw explosions
      setExplosions((prevExplosions) =>
        prevExplosions
          .map((explosion) => ({
            ...explosion,
            radius: Math.min(explosion.radius + 1, explosion.maxRadius),
          }))
          .filter((explosion) => explosion.radius < explosion.maxRadius),
      )

      explosions.forEach((explosion) => {
        ctx.beginPath()
        ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(34, 197, 94, 0.5)"
        ctx.fill()
      })

      // Check for collisions
      missiles.forEach((missile) => {
        explosions.forEach((explosion) => {
          const dx = missile.x - explosion.x
          const dy = missile.y - explosion.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < explosion.radius) {
            setMissiles((prevMissiles) => prevMissiles.filter((m) => m !== missile))
            setScore((prevScore) => prevScore + 10)
          }
        })

        if (missile.y >= GAME_HEIGHT - CITY_HEIGHT) {
          const cityIndex = Math.floor(missile.x / 100)
          if (cities[cityIndex]) {
            setCities((prevCities) => {
              const newCities = [...prevCities]
              newCities[cityIndex] = false
              return newCities
            })
          }
          setMissiles((prevMissiles) => prevMissiles.filter((m) => m !== missile))
        }
      })

      // Check game over condition
      if (cities.every((city) => !city)) {
        setGameOver(true)
        clearInterval(gameLoop)
      }

      // Spawn new missiles
      if (Math.random() < 0.02 * level) {
        const newMissile: Missile = {
          x: Math.random() * GAME_WIDTH,
          y: 0,
          targetX: Math.floor(Math.random() * 6) * 100 + 50,
        }
        setMissiles((prevMissiles) => [...prevMissiles, newMissile])
      }

      // Level up
      if (score > level * 100) {
        setLevel((prevLevel) => prevLevel + 1)
      }
    }, 1000 / 60) // 60 FPS

    return () => clearInterval(gameLoop)
  }, [gameStarted, gameOver, missiles, interceptors, explosions, cities, score, level])

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameStarted || gameOver) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    setInterceptors((prevInterceptors) => [
      ...prevInterceptors,
      { x: GAME_WIDTH / 2, y: GAME_HEIGHT, targetX: x, targetY: y },
    ])
  }

  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setCities([true, true, true, true, true, true])
    setMissiles([])
    setInterceptors([])
    setExplosions([])
    setLevel(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Missile Command...</p>
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
          <div className="text-xs">games.griffen.codes | Missile Command v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Missile Command</p>
            <p className="text-sm">Defend your cities from incoming missiles!</p>
            {gameStarted && !gameOver && (
              <p className="text-lg mt-2">
                Score: {score} | Level: {level} | Cities: {cities.filter(Boolean).length}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
              className="border border-green-500"
              onClick={handleCanvasClick}
            />
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
              <p className="text-xl mb-4">Game Over! Your score: {score}</p>
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
        <p>Click on the game area to launch interceptors and destroy incoming missiles.</p>
      </div>
    </div>
  )
}

