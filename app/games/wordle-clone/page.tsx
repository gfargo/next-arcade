"use client";

import type React from "react";

import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const WORDS = [
  "REACT",
  "GAMES",
  "CLONE",
  "GUESS",
  "WORDS",
  "PIXEL",
  "RETRO",
  "ARCADE",
  "CODER",
  "LOGIC",
];

export default function WordleClone() {
  const [loading, setLoading] = useState(true);
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      startNewGame();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const startNewGame = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTargetWord(randomWord);
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (gameOver) return;

    if (e.key === "Enter") {
      if (currentGuess.length !== WORD_LENGTH) {
        setMessage("Word must be 5 letters long");
        return;
      }

      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);

      if (currentGuess === targetWord) {
        setMessage("Congratulations! You guessed the word!");
        setGameOver(true);
      } else if (newGuesses.length >= MAX_GUESSES) {
        setMessage(`Game over! The word was ${targetWord}`);
        setGameOver(true);
      }

      setCurrentGuess("");
    } else if (e.key === "Backspace") {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (/^[A-Za-z]$/.test(e.key) && currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(currentGuess + e.key.toUpperCase());
    }
  };

  const renderGuess = (guess: string, isCurrentGuess = false) => {
    const tiles = [];
    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = guess[i] || "";
      let className =
        "w-12 h-12 border border-green-500 flex items-center justify-center text-2xl";

      if (!isCurrentGuess && letter) {
        if (targetWord[i] === letter) {
          className += " bg-green-700";
        } else if (targetWord.includes(letter)) {
          className += " bg-yellow-700";
        } else {
          className += " bg-gray-700";
        }
      }

      tiles.push(
        <div
          key={i}
          className={className}
        >
          {letter}
        </div>
      );
    }
    return <div className="flex gap-2 mb-2">{tiles}</div>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Wordle Clone...</p>
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
          <div className="text-xs">games.griffen.codes | Wordle Clone v1.0</div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Wordle Clone</p>
            <p className="text-sm">Guess the 5-letter word in 6 tries</p>
          </div>

          <div className="guesses-container flex flex-col items-center">
            {guesses.map((guess) => renderGuess(guess))}
            {!gameOver && renderGuess(currentGuess, true)}
            {Array(MAX_GUESSES - guesses.length - 1)
              .fill("")
              .map((_, index) => (
                <div
                  key={index}
                  className="flex gap-2 mb-2"
                >
                  {Array(WORD_LENGTH)
                    .fill("")
                    .map((_, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 border border-green-500 flex items-center justify-center text-2xl"
                      ></div>
                    ))}
                </div>
              ))}
          </div>

          {!gameOver && (
            <div className="input-container flex justify-center">
              <input
                type="text"
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value.toUpperCase())}
                onKeyDown={handleKeyPress}
                maxLength={WORD_LENGTH}
                className="bg-black border border-green-500 text-green-500 px-3 py-2 w-40 text-center"
                placeholder="Type here"
                autoFocus
              />
            </div>
          )}

          {message && <p className="text-center text-yellow-400">{message}</p>}

          {gameOver && (
            <div className="flex justify-center mt-4">
              <button
                onClick={startNewGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                New Game
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-center text-green-700">
        <p>Type your guess and press Enter to submit</p>
      </div>
    </div>
  );
}
