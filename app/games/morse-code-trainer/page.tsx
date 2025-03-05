"use client";

import type React from "react";

import { ArrowLeft, RefreshCw, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const MORSE_CODE: { [key: string]: string } = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
};

const LEVELS = [
  { chars: Object.keys(MORSE_CODE), time: 30 },
  {
    words: [
      "TO",
      "BE",
      "OF",
      "AND",
      "IN",
      "THAT",
      "HAVE",
      "IT",
      "FOR",
      "NOT",
      "ON",
      "WITH",
      "HE",
      "AS",
      "YOU",
      "DO",
      "AT",
      "THIS",
      "BUT",
      "HIS",
      "BY",
      "FROM",
      "THEY",
      "WE",
      "SAY",
      "HER",
      "SHE",
      "OR",
      "AN",
      "WILL",
    ],
    time: 45,
  },
  {
    words: [
      "ABOUT",
      "AFTER",
      "AGAIN",
      "BELOW",
      "COULD",
      "EVERY",
      "FIRST",
      "FOUND",
      "GREAT",
      "HOUSE",
      "LARGE",
      "LEARN",
      "NEVER",
      "OTHER",
      "PLACE",
      "PLANT",
      "POINT",
      "RIGHT",
      "SMALL",
      "SOUND",
      "SPELL",
      "STILL",
      "STUDY",
      "THEIR",
      "THERE",
      "THESE",
      "THING",
      "THINK",
      "THREE",
      "WATER",
      "WHERE",
      "WHICH",
      "WORLD",
      "WOULD",
      "WRITE",
    ],
    time: 60,
  },
];

const SHORT_WORDS = [
  "AT",
  "BE",
  "DO",
  "GO",
  "HI",
  "IF",
  "IN",
  "IS",
  "IT",
  "ME",
  "MY",
  "NO",
  "OF",
  "OH",
  "OK",
  "ON",
  "OR",
  "SO",
  "TO",
  "UP",
  "US",
  "WE",
];

const COMMON_WORDS = [
  "THE",
  "AND",
  "FOR",
  "ARE",
  "BUT",
  "NOT",
  "YOU",
  "ALL",
  "ANY",
  "CAN",
  "HAD",
  "HER",
  "WAS",
  "ONE",
  "OUR",
  "OUT",
  "DAY",
  "GET",
  "HAS",
  "HIM",
  "HOW",
  "MAN",
  "NEW",
  "NOW",
  "OLD",
  "SEE",
  "TWO",
  "WAY",
  "WHO",
  "BOY",
  "DID",
  "ITS",
  "LET",
  "PUT",
  "SAY",
  "SHE",
  "TOO",
  "USE",
  "THAT",
  "WITH",
  "HAVE",
  "THIS",
  "WILL",
  "YOUR",
  "FROM",
  "THEY",
  "KNOW",
  "WANT",
  "BEEN",
  "GOOD",
  "MUCH",
  "SOME",
  "TIME",
];

export default function MorseCodeTrainer() {
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const [currentLetter, setCurrentLetter] = useState("");
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(LEVELS[0].time);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [prevInputLength, setPrevInputLength] = useState(0);

  const playMorseSound = useCallback(
    (code: string) => {
      if (!soundEnabled) return;

      const audioContext = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);

      const dot = 0.1;
      const dash = dot * 3;
      const pauseBetweenSigns = dot * 2;
      const pauseBetweenLetters = dash;
      const toneDelay = difficulty === "easy" ? 0.125 : 0; // 125ms delay for easy mode

      let startTime = audioContext.currentTime;

      code.split("").forEach((sign) => {
        const duration =
          sign === "." ? dot : sign === "-" ? dash : pauseBetweenLetters;
        if (sign !== " ") {
          gainNode.gain.setValueAtTime(1, startTime);
          gainNode.gain.setValueAtTime(1, startTime + duration);
          gainNode.gain.setValueAtTime(0, startTime + duration + 0.01);
        }
        startTime += duration + pauseBetweenSigns + toneDelay;
      });

      oscillator.start();
      oscillator.stop(startTime);
    },
    [soundEnabled, difficulty]
  );

  const generateNewContent = useCallback(() => {
    let newContent: string;
    if (difficulty === "easy") {
      const level = LEVELS[currentLevel];
      if ("chars" in level && level.chars) {
        newContent =
          level.chars[Math.floor(Math.random() * level.chars.length)];
      } else {
        // Fallback to alphabet if chars not available
        newContent =
          Object.keys(MORSE_CODE)[
            Math.floor(Math.random() * Object.keys(MORSE_CODE).length)
          ];
      }
    } else if (difficulty === "medium") {
      newContent = SHORT_WORDS[Math.floor(Math.random() * SHORT_WORDS.length)];
    } else {
      newContent =
        COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)];
    }
    setCurrentLetter(newContent);
    setUserInput("");
    setShowHint(false);

    // Add a 300ms delay before playing the sound
    setTimeout(() => {
      playMorseSound(
        newContent
          .split("")
          .map((char) => MORSE_CODE[char])
          .join(" ")
      );
    }, 300);
  }, [difficulty, currentLevel, playMorseSound]);

  useEffect(() => {
    const storedHighScore = localStorage.getItem("morseCodeTrainerHighScore");
    if (storedHighScore) {
      setHighScore(Number.parseInt(storedHighScore, 10));
    }
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (gameStarted && !gameOver) {
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
      return () => clearInterval(timer);
    }
  }, [gameStarted, gameOver]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/[^.-]/g, "");
    setUserInput(input);

    if (difficulty === "easy") {
      // Only play sound if new characters are added
      if (input.length > prevInputLength) {
        playMorseSound(input.slice(prevInputLength));
      }

      if (input === MORSE_CODE[currentLetter]) {
        setScore((prevScore) => prevScore + 1);
        setStreak((prevStreak) => prevStreak + 1);
        if (streak + 1 >= 5 && currentLevel < LEVELS.length - 1) {
          setCurrentLevel((prevLevel) => prevLevel + 1);
          setTimeLeft(LEVELS[currentLevel + 1].time);
          setStreak(0);
        }
        generateNewContent();
      }
    } else {
      // For medium and hard modes, we need to check if the input matches the morse code for the entire word
      const expectedMorse = currentLetter
        .split("")
        .map((char) => MORSE_CODE[char])
        .join(" ");

      if (input === expectedMorse.replace(/ /g, "")) {
        setScore((prevScore) => prevScore + currentLetter.length * 2); // More points for longer words
        setStreak((prevStreak) => prevStreak + 1);
        if (streak + 1 >= 3 && currentLevel < LEVELS.length - 1) {
          setCurrentLevel((prevLevel) => prevLevel + 1);
          setTimeLeft(LEVELS[currentLevel + 1].time);
          setStreak(0);
        }
        generateNewContent();
      }
    }

    // Update the previous input length
    setPrevInputLength(input.length);
  };

  const replayMorseSound = () => {
    if (difficulty === "easy") {
      playMorseSound(MORSE_CODE[currentLetter]);
    } else {
      const morseWord = currentLetter
        .split("")
        .map((char) => MORSE_CODE[char])
        .join(" ");
      playMorseSound(morseWord);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setCurrentLevel(0);
    setTimeLeft(LEVELS[0].time);
    setStreak(0);
  };

  const startNewGame = () => {
    let content: string;

    if (difficulty === "easy") {
      const level = LEVELS[currentLevel];
      const availableChars =
        "chars" in level && level.chars ? level.chars : Object.keys(MORSE_CODE);
      content =
        availableChars[Math.floor(Math.random() * availableChars.length)];
    } else if (difficulty === "medium") {
      content = SHORT_WORDS[Math.floor(Math.random() * SHORT_WORDS.length)];
    } else {
      content = COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)];
    }

    setCurrentLetter(content);
    setUserInput("");
    setShowHint(false);
    setGameStarted(true);
    setGameOver(false);
    setTimeLeft(LEVELS[currentLevel].time);
    setStreak(0);

    // Add a delay before playing the sound
    setTimeout(() => {
      if (difficulty === "easy") {
        playMorseSound(MORSE_CODE[content]);
      } else {
        const morseWord = content
          .split("")
          .map((char) => MORSE_CODE[char])
          .join(" ");
        playMorseSound(morseWord);
      }
    }, 500); // 500ms delay
  };

  const toggleHint = () => {
    setShowHint(!showHint);
    if (!showHint) {
      playMorseSound(
        currentLetter
          .split("")
          .map((char) => MORSE_CODE[char])
          .join(" ")
      );
    }
  };

  const renderMorseCode = (code: string) => {
    return code.split("").map((char, index) => (
      <span
        key={index}
        className={`inline-block w-4 h-4 mx-1 ${
          char === "." ? "bg-green-500 rounded-full" : "bg-green-500"
        }`}
      ></span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
        <div className="terminal-container flex-1 border border-green-500 rounded-md p-4">
          <div className="h-full flex flex-col items-center justify-center">
            <div className="text-center">
              <p className="mb-4">Loading Morse Code Trainer...</p>
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
          <div className="text-xs">
            games.griffen.codes | Morse Code Trainer v2.2
          </div>
        </div>

        <div className="game-container space-y-6">
          <div className="game-info text-center">
            <p className="text-xl mb-2">Morse Code Trainer</p>
            <p className="text-sm">
              Translate the {difficulty === "easy" ? "letter/number" : "word"}{" "}
              to text!
            </p>
            <p className="text-lg mt-2">
              Difficulty:{" "}
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} |
              Score: {score} | High Score: {highScore} | Time: {timeLeft}s |
              Streak: {streak}
            </p>
          </div>

          {!gameStarted && !gameOver ? (
            <div className="text-center space-y-4">
              <h2 className="text-xl mb-2">Select Difficulty</h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setDifficulty("easy")}
                  className={`px-4 py-2 border ${
                    difficulty === "easy" ? "bg-green-900 bg-opacity-30" : ""
                  } border-green-500 hover:bg-green-900 hover:bg-opacity-30`}
                >
                  Easy (Letters)
                </button>
                <button
                  onClick={() => setDifficulty("medium")}
                  className={`px-4 py-2 border ${
                    difficulty === "medium" ? "bg-green-900 bg-opacity-30" : ""
                  } border-green-500 hover:bg-green-900 hover:bg-opacity-30`}
                >
                  Medium (Short Words)
                </button>
                <button
                  onClick={() => setDifficulty("hard")}
                  className={`px-4 py-2 border ${
                    difficulty === "hard" ? "bg-green-900 bg-opacity-30" : ""
                  } border-green-500 hover:bg-green-900 hover:bg-opacity-30`}
                >
                  Hard (Common Words)
                </button>
              </div>
              <button
                onClick={startNewGame}
                className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
              >
                Start Game
              </button>
            </div>
          ) : (
            <div className="game-area flex flex-col items-center space-y-4">
              <div
                className="text-6xl font-bold cursor-pointer"
                onClick={replayMorseSound}
                title="Click to replay Morse code"
              >
                {currentLetter}
              </div>
              <div className="morse-input">
                <input
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  className="bg-black border-b-2 border-green-500 text-green-500 text-center text-2xl w-40 focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="morse-visualization flex items-center justify-center h-8">
                {renderMorseCode(userInput)}
              </div>
              <div className="controls flex gap-4">
                <button
                  onClick={toggleHint}
                  className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
                >
                  {showHint ? "Hide Hint" : "Show Hint"}
                </button>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30"
                >
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </button>
              </div>
              {showHint && (
                <div className="hint-area text-center">
                  <p>
                    Hint:{" "}
                    {difficulty === "easy"
                      ? MORSE_CODE[currentLetter]
                      : currentLetter
                          .split("")
                          .map((char) => `${char}: ${MORSE_CODE[char]}`)
                          .join(" | ")}
                  </p>
                </div>
              )}
            </div>
          )}
          {gameOver && (
            <div className="game-over text-center">
              <p className="text-2xl mb-4">Game Over!</p>
              <p className="text-xl">Final Score: {score}</p>
              <p className="text-lg">Highest Level: {currentLevel + 1}</p>
              <p className="text-lg">
                Difficulty:{" "}
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </p>
              <button
                onClick={resetGame}
                className="mt-4 px-4 py-2 border border-green-500 hover:bg-green-900 hover:bg-opacity-30 flex items-center gap-2 mx-auto"
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
          Type &quot;.&quot; for dot and &quot;-&quot; for dash, or type the
          letter/word directly
        </p>
        <p>Reach a streak of 5 to advance to the next difficulty level!</p>
      </div>
    </div>
  );
}
