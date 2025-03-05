"use client"

import { useState, useEffect, useRef } from "react"

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 600
const ARROW_SIZE = 40
const TARGET_Y = CANVAS_HEIGHT - 100
const SPAWN_INTERVAL = 1000
const ARROW_SPEED = 3

type Arrow = {
  direction: "left" | "up" | "down" | "right"
  y: number
}

type Props = {
  onGameOver: (score: number) => void
  onScoreUpdate: (score: number) => void
}

export default function RhythmArrowsGame({ onGameOver, onScoreUpdate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [arrows, setArrows] = useState<Arrow[]>([])
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [difficulty, setDifficulty] = useState(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const gameLoop = setInterval(() => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw target line
      ctx.strokeStyle = "#22c55e"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, TARGET_Y)
      ctx.lineTo(CANVAS_WIDTH, TARGET_Y)
      ctx.stroke()

      // Draw and update arrows
      setArrows((prevArrows) => {
        const updatedArrows = prevArrows.map((arrow) => ({
          ...arrow,
          y: arrow.y + ARROW_SPEED * difficulty,
        }))

        updatedArrows.forEach((arrow) => {
          drawArrow(ctx, arrow)
        })

        // Remove arrows that have gone off screen
        const remainingArrows = updatedArrows.filter((arrow) => arrow.y <= CANVAS_HEIGHT)

        // Check for missed arrows
        const missedArrows = updatedArrows.filter((arrow) => arrow.y > TARGET_Y + ARROW_SIZE)
        if (missedArrows.length > 0) {
          setCombo(0)
        }

        return remainingArrows
      })
    }, 1000 / 60) // 60 FPS

    const spawnArrow = setInterval(() => {
      const directions: Arrow["direction"][] = ["left", "up", "down", "right"]
      const newArrow: Arrow = {
        direction: directions[Math.floor(Math.random() * directions.length)],
        y: 0,
      }
      setArrows((prevArrows) => [...prevArrows, newArrow])
    }, SPAWN_INTERVAL / difficulty)

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const direction =
        key === "arrowleft"
          ? "left"
          : key === "arrowup"
            ? "up"
            : key === "arrowdown"
              ? "down"
              : key === "arrowright"
                ? "right"
                : null

      if (direction) {
        const hitArrow = arrows.find(
          (arrow) => arrow.direction === direction && Math.abs(arrow.y - TARGET_Y) < ARROW_SIZE / 2,
        )

        if (hitArrow) {
          setArrows((prevArrows) => prevArrows.filter((arrow) => arrow !== hitArrow))
          setScore((prevScore) => {
            const newScore = prevScore + 10 + combo * 2
            onScoreUpdate(newScore)
            return newScore
          })
          setCombo((prevCombo) => prevCombo + 1)
          playSound("hit")
        } else {
          setCombo(0)
          playSound("miss")
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    // Increase difficulty over time
    const difficultyInterval = setInterval(() => {
      setDifficulty((prevDifficulty) => Math.min(prevDifficulty + 0.1, 2))
    }, 10000)

    return () => {
      clearInterval(gameLoop)
      clearInterval(spawnArrow)
      clearInterval(difficultyInterval)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [arrows, difficulty, combo, onScoreUpdate]) // Added onScoreUpdate to dependencies

  const drawArrow = (ctx: CanvasRenderingContext2D, arrow: Arrow) => {
    ctx.save()
    ctx.translate(CANVAS_WIDTH / 2, arrow.y)

    switch (arrow.direction) {
      case "left":
        ctx.rotate(Math.PI)
        ctx.translate(-ARROW_SIZE, 0)
        break
      case "up":
        ctx.rotate(-Math.PI / 2)
        ctx.translate(-ARROW_SIZE / 2, ARROW_SIZE / 2)
        break
      case "down":
        ctx.rotate(Math.PI / 2)
        ctx.translate(ARROW_SIZE / 2, -ARROW_SIZE / 2)
        break
      case "right":
        // No rotation needed
        break
    }

    ctx.fillStyle = "#22c55e"
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(ARROW_SIZE, ARROW_SIZE / 2)
    ctx.lineTo(ARROW_SIZE, -ARROW_SIZE / 2)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  const playSound = (type: "hit" | "miss") => {
    const audio = new Audio(type === "hit" ? "/sounds/hit.mp3" : "/sounds/miss.mp3")
    audio.play()
  }

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="border border-green-500" />
      <div className="mt-4">
        <p>Score: {score}</p>
        <p>Combo: {combo}</p>
      </div>
    </div>
  )
}

