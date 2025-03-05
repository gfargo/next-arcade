"use client";

import type React from "react";

import { Terminal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [command, setCommand] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Add loading state

  setTimeout(() => {
    setLoading(false);
  }, 1000); // Simulate loading time

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      switch (command) {
        case "1":
          router.push("/games/blackjack");
          break;
        case "2":
          router.push("/games/snake");
          break;
        case "3":
          router.push("/games/hangman");
          break;
        case "4":
          router.push("/games/rock-paper-scissors");
          break;
        case "5":
          router.push("/games/guess-the-number");
          break;
        case "6":
          router.push("/games/memory-card");
          break;
        case "7":
          router.push("/games/tic-tac-toe");
          break;
        case "8":
          router.push("/games/wordle-clone");
          break;
        case "9":
          router.push("/games/minesweeper");
          break;
        case "10":
          router.push("/games/simon-says");
          break;
        case "11":
          router.push("/games/2048");
          break;
        case "12":
          router.push("/games/morse-code-trainer");
          break;
        case "13":
          router.push("/games/lights-out");
          break;
        case "14":
          router.push("/games/duck-hunt");
          break;
        case "15":
          router.push("/games/sudoku-lite");
          break;
        case "16":
          router.push("/games/typing-speed-challenge");
          break;
        case "17":
          router.push("/games/missile-command");
          break;
        case "18":
          router.push("/games/tapper");
          break;
        case "19":
          router.push("/games/pixel-hopper");
          break;
        case "20":
          router.push("/games/pacman");
          break;
        case "21":
          router.push("/games/color-match");
          break;
        case "22":
          router.push("/games/loop-dash");
          break;
        case "23":
          router.push("/games/jump-king-lite");
          break;
        case "24":
          router.push("/games/draw-a-path");
          break;
        case "25":
          router.push("/games/tap-to-zero");
          break;
        case "26":
          router.push("/games/color-swap");
          break;
        case "27":
          router.push("/games/stay-on-the-line");
          break;
        case "28":
          router.push("/games/one-second-challenge");
          break;
        case "29":
          router.push("/games/quickest-draw");
          break;
        case "30":
          router.push("/games/what-changed");
          break;
        case "31":
          router.push("/games/mirror-maze");
          break;
        case "32":
          router.push("/games/emoji-equation");
          break;
        case "33":
          router.push("/games/click-the-smallest");
          break;
        case "34":
          router.push("/games/blurry-vision");
          break;
        case "35":
          router.push("/games/one-pixel-click");
          break;
        case "36":
          router.push("/games/emoji-memory-challenge");
          break;
        case "37":
          router.push("/games/rhythm-arrows");
          break;
        case "38":
          router.push("/games/swipe-the-right-way");
          break;
        default:
          console.log("Invalid command");
      }
      setCommand("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex items-center justify-center">
        <div className="terminal-container border border-green-500 rounded-md p-4">
          <div className="text-center">
            <p className="mb-4">Booting...</p>
            <div className="inline-block w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col">
      <div className="terminal-container flex flex-col border border-green-500 rounded-md p-4 relative">
        <div className="scanline absolute top-0 left-0 w-full h-full pointer-events-none"></div>
        <div className="terminal-header flex items-center justify-between mb-4 border-b border-green-500 pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            <h1 className="text-xl font-bold relative">
              arcade.griffen.codes
              <span className="absolute hidden -right-2 top-0 h-full w-2 bg-green-500 animate-blink duration-800"></span>
            </h1>
          </div>
          <div className="text-xs">v1.0.0 | Games: 38</div>
        </div>

        <div className="terminal-content flex-grow space-y-6 mb-4">
          <section>
            <p className="typing-effect mb-4">
              Welcome to the arcade! A collection of retro-inspired games with a
              terminal aesthetic.
            </p>
            <p className="text-sm mb-6">
              Type a number and press Enter to select a game, or use the links
              below.
            </p>
          </section>

          <section className="games-list">
            <h2 className="text-lg mb-2 border-b border-green-500 pb-1">
              Available Games:
            </h2>
            <ul className="space-y-2 flex flex-grow flex-col">
              <li>
                <Link
                  href="/games/blackjack"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[1]</span> Blackjack -
                  Classic card game against the dealer
                </Link>
              </li>
              <li>
                <Link
                  href="/games/snake"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[2]</span> Snake - Navigate
                  and grow your snake
                </Link>
              </li>
              <li>
                <Link
                  href="/games/hangman"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[3]</span> Hangman - Guess
                  the word before it&apos;s too late
                </Link>
              </li>
              <li>
                <Link
                  href="/games/rock-paper-scissors"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[4]</span> Rock Paper
                  Scissors - Classic hand game against the computer
                </Link>
              </li>
              <li>
                <Link
                  href="/games/guess-the-number"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[5]</span> Guess the Number
                  - Try to guess the secret number
                </Link>
              </li>
              <li>
                <Link
                  href="/games/memory-card"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[6]</span> Memory Card -
                  Match pairs of cards to win
                </Link>
              </li>
              <li>
                <Link
                  href="/games/tic-tac-toe"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[7]</span> Tic-Tac-Toe -
                  Classic two-player strategy game
                </Link>
              </li>
              <li>
                <Link
                  href="/games/wordle-clone"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[8]</span> Wordle Clone -
                  Guess the five-letter word
                </Link>
              </li>
              <li>
                <Link
                  href="/games/minesweeper"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[9]</span> Minesweeper -
                  Clear the board without hitting mines
                </Link>
              </li>
              <li>
                <Link
                  href="/games/simon-says"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[10]</span> Simon Says -
                  Repeat the sequence of colors
                </Link>
              </li>
              <li>
                <Link
                  href="/games/2048"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[11]</span> 2048 - Combine
                  tiles to reach 2048
                </Link>
              </li>
              <li>
                <Link
                  href="/games/morse-code-trainer"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[12]</span> Morse Code
                  Trainer - Learn and practice Morse code
                </Link>
              </li>
              <li>
                <Link
                  href="/games/lights-out"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[13]</span> Lights Out -
                  Turn off all the lights in this puzzle game
                </Link>
              </li>
              <li>
                <Link
                  href="/games/duck-hunt"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[14]</span> Duck Hunt -
                  Shoot ducks as they fly across the screen
                </Link>
              </li>
              <li>
                <Link
                  href="/games/sudoku-lite"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[15]</span> Sudoku Lite -
                  Simplified Sudoku with a 6x6 grid
                </Link>
              </li>
              <li>
                <Link
                  href="/games/typing-speed-challenge"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[16]</span> Typing Speed
                  Challenge - Test your typing speed and accuracy
                </Link>
              </li>
              <li>
                <Link
                  href="/games/missile-command"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[17]</span> Missile Command
                  - Defend your cities from incoming missiles
                </Link>
              </li>
              <li>
                <Link
                  href="/games/tapper"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[18]</span> Tapper - Serve
                  drinks to customers before they reach the end of the bar
                </Link>
              </li>
              <li>
                <Link
                  href="/games/pixel-hopper"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[19]</span> Pixel Hopper -
                  Jump over obstacles and survive as long as you can
                </Link>
              </li>
              <li>
                <Link
                  href="/games/pacman"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[20]</span> Pacman - Eat all
                  the pellets and avoid the ghosts!
                </Link>
              </li>
              <li>
                <Link
                  href="/games/color-match"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[21]</span> Color Match -
                  Test your reflexes by matching colors
                </Link>
              </li>
              <li>
                <Link
                  href="/games/loop-dash"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[22]</span> Loop Dash - Time
                  your jumps to orbit perfectly
                </Link>
              </li>
              <li>
                <Link
                  href="/games/jump-king-lite"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[23]</span> Jump King Lite -
                  Precision jumping challenge
                </Link>
              </li>
              <li>
                <Link
                  href="/games/draw-a-path"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[24]</span> Draw a Path -
                  Connect the dots while avoiding obstacles
                </Link>
              </li>
              <li>
                <Link
                  href="/games/tap-to-zero"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[25]</span> Tap to Zero -
                  Click numbers in descending order quickly
                </Link>
              </li>
              <li>
                <Link
                  href="/games/color-swap"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[26]</span> Color Swap -
                  Swap tiles to match colors in fewest moves
                </Link>
              </li>
              <li>
                <Link
                  href="/games/stay-on-the-line"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[27]</span> Stay on the Line
                  - Keep the dot within the wiggling path
                </Link>
              </li>
              <li>
                <Link
                  href="/games/one-second-challenge"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[28]</span> One-Second
                  Challenge - Stop the countdown timer as close to zero as
                  possible
                </Link>
              </li>
              <li>
                <Link
                  href="/games/quickest-draw"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[29]</span> Quickest Draw -
                  Test your reaction time and accuracy
                </Link>
              </li>
              <li>
                <Link
                  href="/games/what-changed"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[30]</span> What Changed? -
                  Spot the difference in a grid of emojis
                </Link>
              </li>
              <li>
                <Link
                  href="/games/mirror-maze"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[31]</span> Mirror Maze -
                  Navigate a maze with reversed controls
                </Link>
              </li>
              <li>
                <Link
                  href="/games/emoji-equation"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[32]</span> Emoji Equation -
                  Solve math problems using emojis
                </Link>
              </li>
              <li>
                <Link
                  href="/games/click-the-smallest"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[33]</span> Click the
                  Smallest - Test your precision with shrinking buttons
                </Link>
              </li>
              <li>
                <Link
                  href="/games/blurry-vision"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[34]</span> Blurry Vision -
                  Type the word before it becomes clear
                </Link>
              </li>
              <li>
                <Link
                  href="/games/one-pixel-click"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[35]</span> The One-Pixel
                  Click - Test your precision with a shrinking pixel
                </Link>
              </li>
              <li>
                <Link
                  href="/games/emoji-memory-challenge"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[36]</span> Emoji Memory
                  Challenge - Memorize and recreate emoji sequences
                </Link>
              </li>
              <li>
                <Link
                  href="/games/rhythm-arrows"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[37]</span> Rhythm Arrows -
                  Press arrow keys in sync with falling arrows
                </Link>
              </li>
              <li>
                <Link
                  href="/games/swipe-the-right-way"
                  className="block p-2 hover:bg-green-900 hover:bg-opacity-30 transition-colors"
                >
                  <span className="text-yellow-400">[38]</span> Swipe the Right
                  Way - Swipe in the direction shown on screen
                </Link>
              </li>
            </ul>
          </section>

          <section className="terminal-input mt-auto  ">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">guest@arcade:~$</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  className="w-full bg-transparent border-none outline-none focus:ring-0"
                  placeholder="Type a command..."
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyPress={handleCommand}
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      <footer className="mt-4 text-xs text-center text-green-700">
        <p>
          Created by{" "}
          <a
            href="https://griffen.codes"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-green-300"
          >
            griffen.codes
          </a>{" "}
          and{" "}
          <a
            href="https://v0.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-green-300"
          >
            v0.dev
          </a>
          , an AI-powered development tool from{" "}
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-green-300"
          >
            vercel
          </a>
        </p>
        <p className="mt-1">Press F11 for fullscreen experience</p>
      </footer>
    </div>
  );
}
