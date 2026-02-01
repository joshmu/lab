/**
 * Canvas renderer for the tilt maze game
 * Optimized for mobile with minimal redraws
 */

import { type Maze } from "./maze";
import { type Ball } from "./physics";

export interface RenderConfig {
  cellSize: number;
  wallColor: string;
  wallWidth: number;
  ballColor: string;
  ballShadowColor: string;
  startColor: string;
  goalColor: string;
  backgroundColor: string;
}

export const defaultRenderConfig: RenderConfig = {
  cellSize: 40,
  wallColor: "#e5e5e5",
  wallWidth: 3,
  ballColor: "#171717",
  ballShadowColor: "rgba(0, 0, 0, 0.2)",
  startColor: "#22c55e",
  goalColor: "#ef4444",
  backgroundColor: "#fafafa",
};

/**
 * Render the maze walls to a canvas
 * This should be called once when the maze changes
 */
export function renderMaze(
  ctx: CanvasRenderingContext2D,
  maze: Maze,
  config: RenderConfig
): void {
  const { cellSize, wallColor, wallWidth, startColor, goalColor, backgroundColor } = config;
  const width = maze.width * cellSize;
  const height = maze.height * cellSize;

  // Clear and fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Draw start zone
  ctx.fillStyle = startColor;
  ctx.globalAlpha = 0.3;
  ctx.fillRect(
    maze.start.x * cellSize,
    maze.start.y * cellSize,
    cellSize,
    cellSize
  );

  // Draw goal zone
  ctx.fillStyle = goalColor;
  ctx.fillRect(
    maze.end.x * cellSize,
    maze.end.y * cellSize,
    cellSize,
    cellSize
  );
  ctx.globalAlpha = 1;

  // Draw walls - batched into single stroke for performance
  ctx.strokeStyle = wallColor;
  ctx.lineWidth = wallWidth;
  ctx.lineCap = "square";
  ctx.beginPath();

  for (let y = 0; y < maze.height; y++) {
    for (let x = 0; x < maze.width; x++) {
      const cell = maze.cells[y][x];
      const px = x * cellSize;
      const py = y * cellSize;

      if (cell.north) {
        ctx.moveTo(px, py);
        ctx.lineTo(px + cellSize, py);
      }
      if (cell.south) {
        ctx.moveTo(px, py + cellSize);
        ctx.lineTo(px + cellSize, py + cellSize);
      }
      if (cell.west) {
        ctx.moveTo(px, py);
        ctx.lineTo(px, py + cellSize);
      }
      if (cell.east) {
        ctx.moveTo(px + cellSize, py);
        ctx.lineTo(px + cellSize, py + cellSize);
      }
    }
  }

  ctx.stroke();
}

/**
 * Render the ball at its current position
 * This should be called every frame
 */
export function renderBall(
  ctx: CanvasRenderingContext2D,
  ball: Ball,
  config: RenderConfig
): void {
  const { ballColor, ballShadowColor } = config;

  // Draw shadow (offset slightly)
  ctx.beginPath();
  ctx.arc(ball.x + 2, ball.y + 2, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ballShadowColor;
  ctx.fill();

  // Draw ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ballColor;
  ctx.fill();

  // Add highlight for 3D effect
  ctx.beginPath();
  ctx.arc(
    ball.x - ball.radius * 0.3,
    ball.y - ball.radius * 0.3,
    ball.radius * 0.2,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.fill();
}

/**
 * Render win celebration effect (expanding circle from goal)
 * @param progress - Animation progress from 0 to 1
 */
export function renderWinEffect(
  ctx: CanvasRenderingContext2D,
  maze: Maze,
  config: RenderConfig,
  progress: number
): void {
  const { cellSize, goalColor } = config;
  const centerX = (maze.end.x + 0.5) * cellSize;
  const centerY = (maze.end.y + 0.5) * cellSize;

  // Expanding circle
  const maxRadius = Math.max(maze.width, maze.height) * cellSize;
  const radius = maxRadius * progress;

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = goalColor;
  ctx.globalAlpha = 0.3 * (1 - progress);
  ctx.fill();
  ctx.globalAlpha = 1;
}
