"use client"

import type React from "react"

import { ArrowLeft, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"

const CANVAS_WIDTH = 300
const CANVAS_HEIGHT = 400
const NUMBER_COUNT = 10
const GAME_DURATION = 30 // seconds

interface NumberObject {
  value: number
  x: number
  y: number
  radius: number
}

export default function TapToZero() {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [startTime, setStartTime] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const numbersRef = useRef<NumberObject[]>([])
  const currentNumberRef = useRef(NUMBER_COUNT)
  const completionTimeRef = useRef("")
  const animationFrameRef = useRef<number|undefined>(undefined)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver) return

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
  }, [gameStarted, gameOver])

  const generateNumbers = useCallback(() => {
    const newNumbers: NumberObject[] = []
    for (let i = 1; i <= NUMBER_COUNT; i++) {
      newNumbers.push({
        value: i,
        x: Math.random() * (CANVAS_WIDTH - 40) + 20,
        y: Math.random() * (CANVAS_HEIGHT - 40) + 20,
        radius: 20,
      })
    }
    numbersRef.current = newNumbers
  }, [])

  const drawNumbers = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    numbersRef.current.forEach((num) => {
      ctx.beginPath()
      ctx.arc(num.x, num.y, num.radius, 0, Math.PI * 2)
      ctx.fillStyle = num.value === currentNumberRef.current ? "#22c55e" : "#15803d"
      ctx.fill()
      ctx.fillStyle = "#ffffff"
      ctx.font = "16px monospace"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(num.value.toString(), num.x, num.y)
    })

    animationFrameRef.current = requestAnimationFrame(drawNumbers)
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    generateNumbers()
    drawNumbers()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameStarted, gameOver, generateNumbers, drawNumbers])

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!gameStarted || gameOver) return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const clickedNumber = numbersRef.current.find((num) => Math.hypot(x - num.x, y - num.y) <= num.radius)

      if (clickedNumber && clickedNumber.value === currentNumberRef.current) {
        setScore((prevScore) => prevScore + Math.ceil((timeLeft / GAME_DURATION) * 10))
        currentNumberRef.current -= 1
        playSound("tap")

        if (currentNumberRef.current === 0) {
          const endTime = Date.now()
          const completionTime = ((endTime - startTime) / 1000).toFixed(2)
          setGameOver(true)
          playSound("success")
          setTimeLeft((prevTime) => {
            const bonusPoints = Math.floor(prevTime * 10)
            setScore((prevScore) => prevScore + bonusPoints)
            return prevTime
          })
          completionTimeRef.current = completionTime
        } else {
          numbersRef.current = numbersRef.current.filter((num) => num.value !== clickedNumber.value)
        }
      }
    },
    [gameStarted, gameOver, timeLeft, startTime],
  )

  const startGame = useCallback(() => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    currentNumberRef.current = NUMBER_COUNT
    setTimeLeft(GAME_DURATION)
    generateNumbers()
    setStartTime(Date.now())
  }, [generateNumbers])

  const playSound = (type: "tap" | "success") => {
    const audio = new Audio(type === "tap" ? "/sounds/tap.mp3" : "/sounds/success.mp3")
    audio.play()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Tap to Zero...</p>
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
          <div className="text-xs">games.griffen.codes | Tap to Zero v1.1</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Tap to Zero</p>
            <p className="text-sm">Click numbers in descending order as fast as possible!</p>
            {gameStarted && !gameOver && (
              <p className="text-lg mt-2">
                Score: {score} | Time: {timeLeft}s | Current: {currentNumberRef.current}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border border-green-500 cursor-pointer"
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
              <p className="text-xl mb-4">
                Game Over! {currentNumberRef.current === 0 ? `You won in ${completionTimeRef.current}s!` : "Time's up!"}
              </p>
              <p className="text-lg mb-4">Your score: {score}</p>
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
        <p>Click the numbers in descending order, starting from {NUMBER_COUNT}. Be quick!</p>
      </div>
    </div>
  )
}

