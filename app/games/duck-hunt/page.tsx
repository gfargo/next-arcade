"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

const GAME_WIDTH = 600
const GAME_HEIGHT = 400
const DUCK_WIDTH = 40
const DUCK_HEIGHT = 40

type Duck = {
  x: number
  y: number
  direction: "left" | "right"
  speed: number
}

export default function DuckHunt() {
  const [ducks, setDucks] = useState<Duck[]>([])
  const [score, setScore] = useState(0)
  const [shots, setShots] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [loading, setLoading] = useState(true)

  const createDuck = useCallback((): Duck => {
    const direction = Math.random() > 0.5 ? "left" : "right"
    return {
      x: direction === "left" ? GAME_WIDTH : -DUCK_WIDTH,
      y: Math.random() * (GAME_HEIGHT - DUCK_HEIGHT),
      direction,
      speed: Math.random() * 2 + 1,
    }
  }, [])

  const initializeGame = useCallback(() => {
    setDucks([createDuck()])
    setScore(0)
    setShots(0)
    setGameOver(false)
    setGameStarted(true)
  }, [createDuck])

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const gameLoop = setInterval(() => {
      setDucks((prevDucks) => {
        const newDucks = prevDucks.map((duck) => ({
          ...duck,
          x: duck.direction === "left" ? duck.x - duck.speed : duck.x + duck.speed,
        }))

        // Remove ducks that have left the screen
        const remainingDucks = newDucks.filter(
          (duck) =>
            (duck.direction === "left" && duck.x + DUCK_WIDTH > 0) ||
            (duck.direction === "right" && duck.x < GAME_WIDTH),
        )

        // Add new ducks
        while (remainingDucks.length < 3) {
          remainingDucks.push(createDuck())
        }

        return remainingDucks
      })

      // Check game over condition
      if (shots >= 20) {
        setGameOver(true)
      }
    }, 1000 / 60) // 60 FPS

    return () => clearInterval(gameLoop)
  }, [gameStarted, gameOver, shots, createDuck])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (gameOver) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setShots((prevShots) => prevShots + 1)

    setDucks((prevDucks) => {
      const newDucks = prevDucks.filter((duck) => {
        const hitDuck = x >= duck.x && x <= duck.x + DUCK_WIDTH && y >= duck.y && y <= duck.y + DUCK_HEIGHT

        if (hitDuck) {
          setScore((prevScore) => prevScore + 1)
        }

        return !hitDuck
      })

      while (newDucks.length < 3) {
        newDucks.push(createDuck())
      }

      return newDucks
    })
  }

  const renderGame = () => (
    <div
      className="relative w-[600px] h-[400px] border border-green-500 overflow-hidden cursor-crosshair"
      onClick={handleClick}
    >
      {ducks.map((duck, index) => (
        <div
          key={index}
          className="absolute text-2xl"
          style={{
            left: duck.x,
            top: duck.y,
            transform: duck.direction === "left" ? "scaleX(-1)" : "none",
          }}
        >
          🦆
        </div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Duck Hunt...</p>
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
          <div className="text-xs">games.griffen.codes | Duck Hunt v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Duck Hunt</p>
            <p className="text-sm">Shoot the ducks before you run out of shots!</p>
            <p className="text-lg mt-2">
              Score: {score} | Shots: {shots}/20
            </p>
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
        <p>Click on the ducks to shoot them. You have 20 shots.</p>
      </div>
    </div>
  )
}

