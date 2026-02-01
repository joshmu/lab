/**
 * Game state management for the tilt maze game
 * Now uses circular mazes with rings
 */

import { generateCircularMaze, type CircularMaze } from "./circular-maze";
import { createBall, type Ball } from "./physics";

export type GameStatus = "start" | "playing" | "won" | "paused";

export interface GameState {
  status: GameStatus;
  level: number;
  maze: CircularMaze;
  ball: Ball;
  prevBall: Ball; // Previous ball position for tunneling detection
  startTime: number;
  elapsedTime: number;
  bestTimes: Record<number, number>;
  centerX: number;
  centerY: number;
}

export interface LevelConfig {
  rings: number;
  canvasSize: number;
  ballRadius: number;
}

/**
 * Get level configuration based on level number
 * Difficulty increases with level
 */
export function getLevelConfig(level: number): LevelConfig {
  // Start with 6 rings, increase by 1 each level, cap at 12
  // More rings = thinner paths = harder
  const rings = Math.min(6 + Math.floor((level - 1) / 2), 12);

  // Fixed canvas size (maze is fixed at 150 radius)
  const canvasSize = 320;

  // Ball radius - smaller for more rings to fit through paths
  const ballRadius = Math.max(3, 5 - rings * 0.15);

  return {
    rings,
    canvasSize,
    ballRadius,
  };
}

/**
 * Create initial game state
 */
export function createInitialState(): GameState {
  const level = 1;
  const config = getLevelConfig(level);
  const maze = generateCircularMaze(config.rings);

  const centerX = config.canvasSize / 2;
  const centerY = config.canvasSize / 2;

  // Start ball on outer ring
  const startAngle = -Math.PI / 2; // Top
  const startRadius = maze.totalRadius - maze.ringWidth / 2;
  const ballX = centerX + Math.cos(startAngle) * startRadius;
  const ballY = centerY + Math.sin(startAngle) * startRadius;

  const ball = createBall(ballX, ballY, config.ballRadius);

  return {
    status: "start",
    level,
    maze,
    ball,
    prevBall: ball,
    startTime: 0,
    elapsedTime: 0,
    bestTimes: loadBestTimes(),
    centerX,
    centerY,
  };
}

/**
 * Start a new level
 */
export function startLevel(state: GameState, level: number): GameState {
  const config = getLevelConfig(level);
  const maze = generateCircularMaze(config.rings);

  const canvasSize = config.canvasSize;
  const centerX = canvasSize / 2;
  const centerY = canvasSize / 2;

  // Start ball on outer ring (random position)
  const segCount = maze.segmentsPerRing[maze.rings - 1];
  const startSeg = Math.floor(Math.random() * segCount);
  const segmentAngle = (2 * Math.PI) / segCount;
  const startAngle = startSeg * segmentAngle - Math.PI / 2 + segmentAngle / 2;
  const startRadius = maze.totalRadius - maze.ringWidth / 2;

  const ballX = centerX + Math.cos(startAngle) * startRadius;
  const ballY = centerY + Math.sin(startAngle) * startRadius;

  const ball = createBall(ballX, ballY, config.ballRadius);

  return {
    ...state,
    status: "playing",
    level,
    maze,
    ball,
    prevBall: ball,
    startTime: Date.now(),
    elapsedTime: 0,
    centerX,
    centerY,
  };
}

/**
 * Handle level completion
 */
export function completeLevel(state: GameState): GameState {
  const elapsedTime = Date.now() - state.startTime;
  const currentBest = state.bestTimes[state.level];
  const newBest =
    currentBest === undefined || elapsedTime < currentBest
      ? elapsedTime
      : currentBest;

  const bestTimes = {
    ...state.bestTimes,
    [state.level]: newBest,
  };

  saveBestTimes(bestTimes);

  return {
    ...state,
    status: "won",
    elapsedTime,
    bestTimes,
  };
}

/**
 * Reset to current level
 */
export function resetLevel(state: GameState): GameState {
  return startLevel(state, state.level);
}

/**
 * Advance to next level
 */
export function nextLevel(state: GameState): GameState {
  return startLevel(state, state.level + 1);
}

/**
 * Format time in mm:ss.ms format
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);

  return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
}

// Local storage helpers
const STORAGE_KEY = "tilt-maze-best-times";

function loadBestTimes(): Record<number, number> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveBestTimes(times: Record<number, number>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(times));
  } catch {
    // Ignore storage errors
  }
}
