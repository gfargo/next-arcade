"use client";

import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const COLORS = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00"];
const INITIAL_SPEED = 2000;
const SPEED_INCREASE = 0.95;
const GAME_DURATION = 30; // seconds

export default function ColorMatch() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore] = useState(0);
  const [targetColor, setTargetColor] = useState(COLORS[0]);
  const [rotatingColor, setRotatingColor] = useState(COLORS[0]);
  const [rotationSpeed, setRotationSpeed] = useState(INITIAL_SPEED);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let rotationAngle = 0;
    let lastColorChangeTime = Date.now();

    const gameLoop = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw target color circle
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 50, 0, Math.PI * 2);
      ctx.fillStyle = targetColor;
      ctx.fill();

      // Draw rotating color arc
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        80,
        rotationAngle,
        rotationAngle + Math.PI / 2
      );
      ctx.lineTo(canvas.width / 2, canvas.height / 2);
      ctx.fillStyle = rotatingColor;
      ctx.fill();

      rotationAngle += Math.PI / 32;

      if (rotationAngle >= Math.PI * 2) {
        rotationAngle = 0;
      }

      if (Date.now() - lastColorChangeTime > rotationSpeed) {
        setRotatingColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
        lastColorChangeTime = Date.now();
      }
    }, 1000 / 60); // 60 FPS

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => {
      clearInterval(gameLoop);
      clearInterval(timer);
    };
  }, [gameStarted, gameOver, targetColor, rotatingColor, rotationSpeed]);

  const handleCanvasClick = () => {
    if (!gameStarted || gameOver) return;

    if (targetColor === rotatingColor) {
      setScore((prevScore) => prevScore + 1);
      setTargetColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
      setRotationSpeed((prevSpeed) => prevSpeed * SPEED_INCREASE);
      playSound("correct");
    } else {
      setScore((prevScore) => Math.max(0, prevScore - 1));
      playSound("incorrect");
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTargetColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setRotatingColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    setRotationSpeed(INITIAL_SPEED);
    setTimeLeft(GAME_DURATION);
  };

  const playSound = (type: "correct" | "incorrect") => {
    const audio = new Audio(
      type === "correct" ? "/sounds/correct.mp3" : "/sounds/incorrect.mp3"
    );
    audio.play();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Color Match...</p>
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
          <div className="text-xs">games.griffen.codes | Color Match v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Color Match</p>
            <p className="text-sm">
              Tap when the rotating color matches the center!
            </p>
            {gameStarted && !gameOver && (
              <p className="text-lg mt-2">
                Score: {score} | Time: {timeLeft}s
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
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
          Click or tap when the rotating color matches the center color. Be
          quick!
        </p>
      </div>
    </div>
  );
}
