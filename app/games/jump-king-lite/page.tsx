"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

const CANVAS_WIDTH = 300
const CANVAS_HEIGHT = 400
const PLAYER_SIZE = 20
const PLATFORM_HEIGHT = 10
const GRAVITY = 0.5
const MAX_JUMP_POWER = 15
const INITIAL_PLATFORM_Y = CANVAS_HEIGHT * 0.5
const MAX_ANGLE = Math.PI / 3
const PLATFORM_POOL_SIZE = 20
const MIN_PLATFORM_DISTANCE = 50

interface Platform {
  x: number
  y: number
  width: number
  active: boolean
}

export default function JumpKingLite() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const playerRef = useRef({ x: CANVAS_WIDTH / 2, y: INITIAL_PLATFORM_Y - PLAYER_SIZE, vy: 0, vx: 0 })
  const platformsRef = useRef<Platform[]>([])
  const [jumpPower, setJumpPower] = useState(0)
  const [isCharging, setIsCharging] = useState(false)
  const [jumpAngle, setJumpAngle] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  const initializePlatformPool = useCallback(() => {
    platformsRef.current = Array(PLATFORM_POOL_SIZE)
      .fill(null)
      .map(() => ({
        x: 0,
        y: 0,
        width: 0,
        active: false,
      }))
  }, [])

  const getInactivePlatform = useCallback(() => {
    return platformsRef.current.find((platform) => !platform.active)
  }, [])

  const addPlatform = useCallback(
    (x: number, y: number, width: number) => {
      const platform = getInactivePlatform()
      if (platform) {
        platform.x = x
        platform.y = y
        platform.width = width
        platform.active = true
      }
    },
    [getInactivePlatform],
  )

  const removePlatform = useCallback((platform: Platform) => {
    platform.active = false
  }, [])

  const generatePlatform = useCallback(() => {
    const x = Math.random() * (CANVAS_WIDTH - 60)
    const y = -PLATFORM_HEIGHT
    const width = 60 + Math.random() * 60

    // Check for overlaps with existing platforms
    const overlap = platformsRef.current.some(
      (p) => p.active && Math.abs(p.y - y) < MIN_PLATFORM_DISTANCE && x < p.x + p.width && x + width > p.x,
    )

    if (!overlap) {
      addPlatform(x, y, width)
    }
  }, [addPlatform])

  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver) return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Update player position
    playerRef.current.x += playerRef.current.vx
    playerRef.current.y += playerRef.current.vy
    playerRef.current.vy += GRAVITY
    playerRef.current.vx *= 0.99 // Air resistance

    // Check collision with platforms
    platformsRef.current.forEach((platform) => {
      if (
        platform.active &&
        playerRef.current.y + PLAYER_SIZE > platform.y &&
        playerRef.current.y + PLAYER_SIZE < platform.y + PLATFORM_HEIGHT &&
        playerRef.current.x + PLAYER_SIZE > platform.x &&
        playerRef.current.x < platform.x + platform.width &&
        playerRef.current.vy > 0
      ) {
        playerRef.current.y = platform.y - PLAYER_SIZE
        playerRef.current.vy = 0
        playerRef.current.vx = 0
      }
    })

    // Check collision with walls
    if (playerRef.current.x < 0 || playerRef.current.x + PLAYER_SIZE > CANVAS_WIDTH) {
      playerRef.current.x = Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_SIZE, playerRef.current.x))
      playerRef.current.vx *= -0.5 // Bounce off walls with reduced velocity
    }

    // Move platforms down and remove off-screen platforms
    platformsRef.current.forEach((platform) => {
      if (platform.active) {
        platform.y += 1
        if (platform.y > CANVAS_HEIGHT) {
          removePlatform(platform)
        }
      }
    })

    // Add new platform if needed
    if (platformsRef.current.filter((p) => p.active).length < 5) {
      generatePlatform()
    }

    // Draw platforms
    ctx.fillStyle = "#22c55e"
    platformsRef.current.forEach((platform) => {
      if (platform.active) {
        ctx.fillRect(platform.x, platform.y, platform.width, PLATFORM_HEIGHT)
      }
    })

    // Draw player
    ctx.fillStyle = "#22c55e"
    ctx.fillRect(playerRef.current.x, playerRef.current.y, PLAYER_SIZE, PLAYER_SIZE)

    // Draw jump power meter
    if (isCharging) {
      ctx.fillStyle = "#fbbf24"
      ctx.fillRect(10, CANVAS_HEIGHT - 20, (jumpPower / MAX_JUMP_POWER) * (CANVAS_WIDTH - 20), 10)
    }

    // Draw jump angle indicator
    if (isCharging) {
      ctx.strokeStyle = "#fbbf24"
      ctx.beginPath()
      ctx.moveTo(playerRef.current.x + PLAYER_SIZE / 2, playerRef.current.y + PLAYER_SIZE / 2)
      ctx.lineTo(
        playerRef.current.x + PLAYER_SIZE / 2 + Math.cos(jumpAngle) * 30,
        playerRef.current.y + PLAYER_SIZE / 2 - Math.sin(jumpAngle) * 30,
      )
      ctx.stroke()
    }

    // Check game over condition
    if (playerRef.current.y > CANVAS_HEIGHT) {
      setGameOver(true)
      setHighScore((prev) => Math.max(prev, score))
      return
    }

    // Update score
    setScore((prev) => prev + 1)

    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [gameStarted, gameOver, isCharging, jumpPower, jumpAngle, score, generatePlatform, removePlatform])

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

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!gameStarted || gameOver) return
      setIsCharging(true)
      setJumpPower(0)
      updateJumpAngle(e)
    },
    [gameStarted, gameOver],
  )

  const handleMouseUp = useCallback(() => {
    if (!gameStarted || gameOver) return
    setIsCharging(false)
    playerRef.current.vx = Math.cos(jumpAngle) * jumpPower
    playerRef.current.vy = -Math.sin(jumpAngle) * jumpPower
    setJumpPower(0)
    playSound("jump")
  }, [gameStarted, gameOver, jumpAngle, jumpPower])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (isCharging) {
        updateJumpAngle(e)
      }
    },
    [isCharging],
  )

  const updateJumpAngle = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left
      const normalizedX = (x / CANVAS_WIDTH) * 2 - 1
      const angle = normalizedX * MAX_ANGLE
      setJumpAngle(Math.PI / 2 - angle)
    },
    [],
  )

  useEffect(() => {
    if (!isCharging) return

    const chargeInterval = setInterval(() => {
      setJumpPower((prev) => Math.min(prev + 0.5, MAX_JUMP_POWER))
    }, 50)

    return () => clearInterval(chargeInterval)
  }, [isCharging])

  const startGame = useCallback(() => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    playerRef.current = { x: CANVAS_WIDTH / 2, y: INITIAL_PLATFORM_Y - PLAYER_SIZE, vy: 0, vx: 0 }
    initializePlatformPool()
    addPlatform(CANVAS_WIDTH / 2 - 30, INITIAL_PLATFORM_Y, 60)
    addPlatform(Math.random() * (CANVAS_WIDTH - 60), INITIAL_PLATFORM_Y - 100, 60 + Math.random() * 60)
    addPlatform(Math.random() * (CANVAS_WIDTH - 60), INITIAL_PLATFORM_Y - 200, 60 + Math.random() * 60)
    setJumpPower(0)
    setIsCharging(false)
    setJumpAngle(Math.PI / 2)
  }, [initializePlatformPool, addPlatform])

  const playSound = useCallback((type: "jump" | "gameover") => {
    const audio = new Audio(type === "jump" ? "/sounds/jump.mp3" : "/sounds/gameover.mp3")
    audio.play()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Jump King Lite...</p>
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
          <div className="text-xs">games.griffen.codes | Jump King Lite v1.3</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Jump King Lite</p>
            <p className="text-sm">Tap and hold to charge your jump, move to aim, release to leap!</p>
            {gameStarted && !gameOver && <p className="text-lg mt-2">Score: {score}</p>}
          </div>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border border-green-500 cursor-pointer"
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              onTouchMove={handleMouseMove}
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
              {score > highScore && <p className="text-lg mb-4 text-yellow-400">New High Score! 🏆</p>}
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
        <p>Click and hold to charge your jump, move the mouse to aim, release to leap. Time your jumps carefully!</p>
      </div>
    </div>
  )
}

