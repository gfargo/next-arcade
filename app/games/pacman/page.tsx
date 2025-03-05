"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, RefreshCw } from "lucide-react"

const CELL_SIZE = 20
const GRID_WIDTH = 28
const GRID_HEIGHT = 31
const GAME_WIDTH = CELL_SIZE * GRID_WIDTH
const GAME_HEIGHT = CELL_SIZE * GRID_HEIGHT
const DIFFICULTY_SETTINGS = {
  easy: 1,
  normal: 2,
  hard: 3,
}
const PACMAN_MOVE_DELAY = 150 // milliseconds

//const FPS = 10 // Adjust this value to control game speed
type Direction = "up" | "down" | "left" | "right"
type Position = { x: number; y: number }
type Ghost = Position & { direction: Direction }

const INITIAL_PACMAN: Position = { x: 13, y: 23 }
const INITIAL_GHOSTS: Ghost[] = [
  { x: 11, y: 13, direction: "left" },
  { x: 12, y: 13, direction: "left" },
  { x: 15, y: 13, direction: "right" },
  { x: 16, y: 13, direction: "right" },
]

const MAZE = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#.####.#####.##.#####.####.#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.##### ## #####.######",
  "######.##### ## #####.######",
  "######.##          ##.######",
  "######.## ###--### ##.######",
  "######.## #      # ##.######",
  "      .   #      #   .      ",
  "######.## #      # ##.######",
  "######.## ######## ##.######",
  "######.##          ##.######",
  "######.## ######## ##.######",
  "######.## ######## ##.######",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#.####.#####.##.#####.####.#",
  "#o..##.......  .......##..o#",
  "###.##.##.########.##.##.###",
  "###.##.##.########.##.##.###",
  "#......##....##....##......#",
  "#.##########.##.##########.#",
  "#.##########.##.##########.#",
  "#..........................#",
  "############################",
]

const EMOJIS = {
  pacman: "😮",
  ghost: "👻",
  wall: "🟦",
  pellet: "·",
  powerPellet: "🍒",
  empty: " ",
}

export default function Pacman() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [difficulty, setDifficulty] = useState<keyof typeof DIFFICULTY_SETTINGS>("normal")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameStateRef = useRef({
    pacman: INITIAL_PACMAN,
    pacmanDirection: "left" as Direction,
    ghosts: INITIAL_GHOSTS,
    maze: MAZE,
    powerMode: false,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLCanvasElement> | KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
        gameStateRef.current.pacmanDirection = "up"
        break
      case "ArrowDown":
        gameStateRef.current.pacmanDirection = "down"
        break
      case "ArrowLeft":
        gameStateRef.current.pacmanDirection = "left"
        break
      case "ArrowRight":
        gameStateRef.current.pacmanDirection = "right"
        break
    }
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [gameStarted, gameOver, handleKeyDown])

  const getNewPosition = (position: Position, direction: Direction): Position => {
    const newPosition = { ...position }
    switch (direction) {
      case "up":
        newPosition.y = (newPosition.y - 1 + GRID_HEIGHT) % GRID_HEIGHT
        break
      case "down":
        newPosition.y = (newPosition.y + 1) % GRID_HEIGHT
        break
      case "left":
        newPosition.x = (newPosition.x - 1 + GRID_WIDTH) % GRID_WIDTH
        break
      case "right":
        newPosition.x = (newPosition.x + 1) % GRID_WIDTH
        break
    }
    return newPosition
  }

  const movePacman = useCallback(() => {
    const { pacman, pacmanDirection, maze } = gameStateRef.current
    const newPosition = getNewPosition(pacman, pacmanDirection)

    if (maze[newPosition.y][newPosition.x] !== "#") {
      setTimeout(() => {
        gameStateRef.current.pacman = newPosition
        if (maze[newPosition.y][newPosition.x] === ".") {
          setScore((prevScore) => prevScore + 10)
          const newMaze = [...maze]
          newMaze[newPosition.y] =
            newMaze[newPosition.y].substring(0, newPosition.x) +
            " " +
            newMaze[newPosition.y].substring(newPosition.x + 1)
          gameStateRef.current.maze = newMaze
        } else if (maze[newPosition.y][newPosition.x] === "o") {
          setScore((prevScore) => prevScore + 50)
          const newMaze = [...maze]
          newMaze[newPosition.y] =
            newMaze[newPosition.y].substring(0, newPosition.x) +
            " " +
            newMaze[newPosition.y].substring(newPosition.x + 1)
          gameStateRef.current.maze = newMaze
          gameStateRef.current.powerMode = true
          setTimeout(() => {
            gameStateRef.current.powerMode = false
          }, 10000)
        }
      }, PACMAN_MOVE_DELAY)
    }
  }, [getNewPosition])

  const moveGhosts = useCallback(() => {
    const { ghosts, maze } = gameStateRef.current
    gameStateRef.current.ghosts = ghosts.map((ghost) => {
      const possibleDirections: Direction[] = ["up", "down", "left", "right"]
      const validDirections = possibleDirections.filter((dir) => {
        const newPos = getNewPosition(ghost, dir)
        return maze[newPos.y][newPos.x] !== "#"
      })

      const newDirection = validDirections[Math.floor(Math.random() * validDirections.length)]
      const newPosition = getNewPosition(ghost, newDirection)

      return { ...newPosition, direction: newDirection }
    })
  }, [getNewPosition])

  const checkCollisions = useCallback(() => {
    const { pacman, ghosts, powerMode, maze } = gameStateRef.current
    ghosts.forEach((ghost, index) => {
      if (ghost.x === pacman.x && ghost.y === pacman.y) {
        if (powerMode) {
          setScore((prevScore) => prevScore + 200)
          gameStateRef.current.ghosts = ghosts.filter((_, i) => i !== index)
        } else {
          setGameOver(true)
          setHighScore((prevHighScore) => Math.max(prevHighScore, score))
        }
      }
    })

    if (maze.every((row) => !row.includes(".") && !row.includes("o"))) {
      setGameOver(true)
      setHighScore((prevHighScore) => Math.max(prevHighScore, score))
    }
  }, [])

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const { pacman, ghosts, maze, powerMode } = gameStateRef.current

    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Draw maze
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const cell = maze[y][x]
        ctx.fillStyle = "#22c55e"
        ctx.font = `${CELL_SIZE}px Arial`
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        const emoji =
          cell === "#" ? EMOJIS.wall : cell === "." ? EMOJIS.pellet : cell === "o" ? EMOJIS.powerPellet : EMOJIS.empty
        ctx.fillText(emoji, x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2)
      }
    }

    // Draw Pacman
    ctx.fillStyle = "#22c55e"
    ctx.font = `${CELL_SIZE}px Arial`
    ctx.fillText(EMOJIS.pacman, pacman.x * CELL_SIZE + CELL_SIZE / 2, pacman.y * CELL_SIZE + CELL_SIZE / 2)

    // Draw ghosts
    ghosts.forEach((ghost) => {
      ctx.fillStyle = powerMode ? "#ff0000" : "#22c55e"
      ctx.font = `${CELL_SIZE}px Arial`
      ctx.fillText(EMOJIS.ghost, ghost.x * CELL_SIZE + CELL_SIZE / 2, ghost.y * CELL_SIZE + CELL_SIZE / 2)
    })
  }, [])

  useEffect(() => {
    if (!gameStarted || gameOver) return

    let lastTime = 0
    const gameLoop = (currentTime: number) => {
      if (currentTime - lastTime >= 1000 / DIFFICULTY_SETTINGS[difficulty]) {
        movePacman()
        moveGhosts()
        checkCollisions()
        drawGame()
        lastTime = currentTime
      }
      requestAnimationFrame(gameLoop)
    }

    const animationId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [gameStarted, gameOver, movePacman, moveGhosts, checkCollisions, drawGame, difficulty])

  useEffect(() => {
    if (gameStarted && !gameOver) {
      canvasRef.current?.focus()
    }
  }, [gameStarted, gameOver])

  const startGame = () => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    gameStateRef.current = {
      pacman: INITIAL_PACMAN,
      pacmanDirection: "left",
      ghosts: INITIAL_GHOSTS,
      maze: MAZE,
      powerMode: false,
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Pacman...</p>
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
          <div className="text-xs">games.griffen.codes | Pacman v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Pacman</p>
            <p className="text-sm">Eat all the pellets and avoid the ghosts!</p>
            {gameStarted && !gameOver && (
              <p className="text-lg mt-2">
                Score: {score} | High Score: {highScore}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={GAME_WIDTH}
              height={GAME_HEIGHT}
              className="border border-green-500"
              tabIndex={0}
              onKeyDown={(e) => {
                e.preventDefault()
                handleKeyDown(e)
              }}
            />
          </div>

          {!gameStarted && (
            <div className="text-center space-y-4">
              <div className="space-x-2">
                <button
                  onClick={() => setDifficulty("easy")}
                  className={`px-4 py-2 border ${
                    difficulty === "easy" ? "bg-green-900 bg-opacity-30" : ""
                  } border-green-500 hover:bg-green-900 hover:bg-opacity-30`}
                >
                  Easy
                </button>
                <button
                  onClick={() => setDifficulty("normal")}
                  className={`px-4 py-2 border ${
                    difficulty === "normal" ? "bg-green-900 bg-opacity-30" : ""
                  } border-green-500 hover:bg-green-900 hover:bg-opacity-30`}
                >
                  Normal
                </button>
                <button
                  onClick={() => setDifficulty("hard")}
                  className={`px-4 py-2 border ${
                    difficulty === "hard" ? "bg-green-900 bg-opacity-30" : ""
                  } border-green-500 hover:bg-green-900 hover:bg-opacity-30`}
                >
                  Hard
                </button>
              </div>
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
        <p>Use arrow keys to move Pacman. Eat all the pellets to win!</p>
      </div>
    </div>
  )
}

