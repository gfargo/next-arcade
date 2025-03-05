"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

const GAME_WIDTH = 600
const GAME_HEIGHT = 400
const BAR_HEIGHT = 60
const PLAYER_WIDTH = 30
const PLAYER_HEIGHT = 50
const CUSTOMER_WIDTH = 30
const CUSTOMER_HEIGHT = 50
const GLASS_WIDTH = 20
const GLASS_HEIGHT = 20

type Player = {
  x: number
  y: number
  bar: number
}

type Customer = {
  x: number
  y: number
  bar: number
  speed: number
}

type Glass = {
  x: number
  y: number
  bar: number
}

export default function Tapper() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [player, setPlayer] = useState<Player>({
    x: GAME_WIDTH - PLAYER_WIDTH,
    y: GAME_HEIGHT - BAR_HEIGHT - PLAYER_HEIGHT,
    bar: 3,
  })
  const [customers, setCustomers] = useState<Customer[]>([])
  const [glasses, setGlasses] = useState<Glass[]>([])
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

      // Draw bars
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = "#8B4513" // Brown color for wooden bar
        ctx.fillRect(0, i * (BAR_HEIGHT + 40), GAME_WIDTH, BAR_HEIGHT)
      }

      // Draw player
      ctx.fillStyle = "#4CAF50" // Green color for player
      ctx.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT)

      // Update and draw customers
      setCustomers((prevCustomers) =>
        prevCustomers
          .map((customer) => ({
            ...customer,
            x: customer.x + customer.speed,
          }))
          .filter((customer) => customer.x < GAME_WIDTH),
      )

      customers.forEach((customer) => {
        ctx.fillStyle = "#FF5722" // Orange color for customers
        ctx.fillRect(customer.x, customer.y, CUSTOMER_WIDTH, CUSTOMER_HEIGHT)
      })

      // Update and draw glasses
      setGlasses((prevGlasses) =>
        prevGlasses
          .map((glass) => ({
            ...glass,
            x: glass.x - 5,
          }))
          .filter((glass) => glass.x > 0),
      )

      glasses.forEach((glass) => {
        ctx.fillStyle = "#FFC107" // Amber color for glasses
        ctx.fillRect(glass.x, glass.y, GLASS_WIDTH, GLASS_HEIGHT)
      })

      // Check collisions
      glasses.forEach((glass, glassIndex) => {
        customers.forEach((customer, customerIndex) => {
          if (
            glass.bar === customer.bar &&
            glass.x < customer.x + CUSTOMER_WIDTH &&
            glass.x + GLASS_WIDTH > customer.x
          ) {
            setCustomers((prevCustomers) => prevCustomers.filter((_, index) => index !== customerIndex))
            setGlasses((prevGlasses) => prevGlasses.filter((_, index) => index !== glassIndex))
            setScore((prevScore) => prevScore + 10)
          }
        })
      })

      // Check game over condition
      if (customers.some((customer) => customer.x >= GAME_WIDTH - CUSTOMER_WIDTH)) {
        setGameOver(true)
        clearInterval(gameLoop)
      }

      // Spawn new customers
      if (Math.random() < 0.02 * level) {
        const newCustomer: Customer = {
          x: 0,
          y: Math.floor(Math.random() * 4) * (BAR_HEIGHT + 40) + 5,
          bar: Math.floor(Math.random() * 4),
          speed: Math.random() * 1 + 0.5 + level * 0.1,
        }
        setCustomers((prevCustomers) => [...prevCustomers, newCustomer])
      }

      // Level up
      if (score > level * 100) {
        setLevel((prevLevel) => prevLevel + 1)
      }
    }, 1000 / 60) // 60 FPS

    return () => clearInterval(gameLoop)
  }, [gameStarted, gameOver, player, customers, glasses, score, level])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!gameStarted || gameOver) return

    switch (event.key) {
      case "ArrowUp":
        setPlayer((prev) => ({
          ...prev,
          y: Math.max(prev.y - (BAR_HEIGHT + 40), 0),
          bar: Math.max(prev.bar - 1, 0),
        }))
        break
      case "ArrowDown":
        setPlayer((prev) => ({
          ...prev,
          y: Math.min(prev.y + (BAR_HEIGHT + 40), GAME_HEIGHT - PLAYER_HEIGHT),
          bar: Math.min(prev.bar + 1, 3),
        }))
        break
      case " ":
        setGlasses((prev) => [
          ...prev,
          { x: player.x - GLASS_WIDTH, y: player.y + PLAYER_HEIGHT / 2 - GLASS_HEIGHT / 2, bar: player.bar },
        ])
        break
    }
  }

  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    setPlayer({ x: GAME_WIDTH - PLAYER_WIDTH, y: GAME_HEIGHT - BAR_HEIGHT - PLAYER_HEIGHT, bar: 3 })
    setCustomers([])
    setGlasses([])
    setLevel(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Tapper...</p>
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
          <div className="text-xs">games.griffen.codes | Tapper v1.1</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Tapper</p>
            <p className="text-sm">Serve drinks to customers before they reach the end of the bar!</p>
            {gameStarted && !gameOver && (
              <p className="text-lg mt-2">
                Score: {score} | Level: {level}
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
        <p>Use Up/Down arrow keys to move between bars. Press Spacebar to serve drinks.</p>
      </div>
    </div>
  )
}

