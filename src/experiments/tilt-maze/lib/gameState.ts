/**
 * Game state management for the tilt maze game
 */

import { generateMaze, type Maze } from "./maze";
import { createBall, type Ball } from "./physics";

export type GameStatus = "start" | "playing" | "won" | "paused";

export interface GameState {
  status: GameStatus;
  level: number;
  maze: Maze;
  ball: Ball;
  startTime: number;
  elapsedTime: number;
  bestTimes: Record<number, number>;
}

export interface LevelConfig {
  width: number;
  height: number;
  cellSize: number;
  ballRadius: number;
}

/**
 * Get level configuration based on level number
 * Difficulty increases with level
 */
export function getLevelConfig(level: number): LevelConfig {
  // Start at 5x5, increase by 2 each level, cap at 15x15
  const size = Math.min(5 + (level - 1) * 2, 15);

  // Cell size decreases as maze gets larger to fit screen
  const cellSize = Math.max(30, 50 - (level - 1) * 3);

  // Ball radius scales with cell size
  const ballRadius = Math.max(4, cellSize * 0.15);

  return {
    width: size,
    height: size,
    cellSize,
    ballRadius,
  };
}

/**
 * Create initial game state
 */
export function createInitialState(): GameState {
  const level = 1;
  const config = getLevelConfig(level);
  const maze = generateMaze(config.width, config.height);
  const ball = createBall(
    (maze.start.x + 0.5) * config.cellSize,
    (maze.start.y + 0.5) * config.cellSize,
    config.ballRadius
  );

  return {
    status: "start",
    level,
    maze,
    ball,
    startTime: 0,
    elapsedTime: 0,
    bestTimes: loadBestTimes(),
  };
}

/**
 * Start a new level
 */
export function startLevel(state: GameState, level: number): GameState {
  const config = getLevelConfig(level);
  const maze = generateMaze(config.width, config.height);
  const ball = createBall(
    (maze.start.x + 0.5) * config.cellSize,
    (maze.start.y + 0.5) * config.cellSize,
    config.ballRadius
  );

  return {
    ...state,
    status: "playing",
    level,
    maze,
    ball,
    startTime: Date.now(),
    elapsedTime: 0,
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
