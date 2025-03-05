"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const CANVAS_SIZE = 300;
const CENTER = CANVAS_SIZE / 2;
const ORBIT_RADIUS = 100;
const PLAYER_RADIUS = 5;
const INITIAL_SPEED = 0.03;
const SPEED_INCREASE = 1.1;
const TARGET_SIZE = 30;
const TARGET_ANGLE_RANGE = Math.PI / 6; // 30 degrees

export default function LoopDash() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef({ angle: 0, speed: INITIAL_SPEED });
  const targetRef = useRef({ angle: 0, size: TARGET_SIZE });
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const generateNewTarget = useCallback(() => {
    targetRef.current = {
      angle: Math.random() * Math.PI * 2,
      size: TARGET_SIZE,
    };
  }, []);

  const gameLoop = useCallback(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw orbit
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, ORBIT_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw target
    const targetStartAngle = targetRef.current.angle - TARGET_ANGLE_RANGE / 2;
    const targetEndAngle = targetRef.current.angle + TARGET_ANGLE_RANGE / 2;
    ctx.beginPath();
    ctx.arc(CENTER, CENTER, ORBIT_RADIUS, targetStartAngle, targetEndAngle);
    ctx.lineWidth = targetRef.current.size;
    ctx.strokeStyle = "#fbbf24";
    ctx.stroke();

    // Draw player
    const playerX = CENTER + Math.cos(playerRef.current.angle) * ORBIT_RADIUS;
    const playerY = CENTER + Math.sin(playerRef.current.angle) * ORBIT_RADIUS;
    ctx.beginPath();
    ctx.arc(playerX, playerY, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#22c55e";
    ctx.fill();

    // Update player position
    playerRef.current.angle += playerRef.current.speed;
    if (playerRef.current.angle > Math.PI * 2) {
      playerRef.current.angle -= Math.PI * 2;
    }

    // Check if player is within the target
    if (
      playerRef.current.angle >= targetStartAngle &&
      playerRef.current.angle <= targetEndAngle
    ) {
      targetRef.current.size -= 0.5;
      if (targetRef.current.size <= 0) {
        setScore((prevScore) => prevScore + 1);
        playerRef.current.speed *= SPEED_INCREASE;
        generateNewTarget();
      }
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameStarted, gameOver, generateNewTarget]);

  useEffect(() => {
    if (gameStarted && !gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStarted, gameOver, gameLoop]);

  const handleCanvasClick = useCallback(() => {
    if (!gameStarted || gameOver) return;

    const playerAngle = playerRef.current.angle;
    const targetAngle = targetRef.current.angle;
    const angleDifference = Math.abs(playerAngle - targetAngle);

    if (
      angleDifference <= TARGET_ANGLE_RANGE / 2 ||
      angleDifference >= Math.PI * 2 - TARGET_ANGLE_RANGE / 2
    ) {
      // Player clicked within the target
      setScore((prevScore) => prevScore + 1);
      playerRef.current.speed *= SPEED_INCREASE;
      generateNewTarget();
    } else {
      // Player clicked outside the target
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
      }
    }
  }, [gameStarted, gameOver, score, highScore, generateNewTarget]);

  const startGame = useCallback(() => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    playerRef.current = { angle: 0, speed: INITIAL_SPEED };
    generateNewTarget();
  }, [generateNewTarget]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Loop Dash...</p>
              <div className="inline-block w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
      <div className="terminal-container flex-1 border border-green-500 rounded-md p-4 relative">
        <div className="scanline absolute top-0 left-0 w-full h-full pointer-events-none"></div>

        <div className="terminal-header flex items-center justify-between mb-4 border-b border-green-500 pb-2">
          <Link
            href="/"
            className="flex items-center gap-2 hover:text-green-400"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Arcade</span>
          </Link>
          <div className="text-xs">games.griffen.codes | Loop Dash v2.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Loop Dash</p>
            <p className="text-sm">
              Click when the green dot is inside the yellow target!
            </p>
            {gameStarted && <p className="text-lg mt-2">Score: {score}</p>}
          </div>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
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
              <p className="text-xl mb-4">Game Over! Your score: {score}</p>
              {score > highScore && (
                <p className="text-lg mb-4 text-yellow-400">
                  New High Score! 🏆
                </p>
              )}
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
        <p>
          Click when the green dot enters the yellow target area. Be precise and
          quick!
        </p>
      </div>
    </div>
  );
}
