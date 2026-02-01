/**
 * Renderer for circular mazes
 */

import {
  type CircularMaze,
  getSegmentAngles,
  getRingRadii,
} from "./circular-maze";
import { type Ball } from "./physics";

export interface CircularRenderConfig {
  wallColor: string;
  wallWidth: number;
  ballColor: string;
  ballShadowColor: string;
  startColor: string;
  goalColor: string;
  backgroundColor: string;
  pathColor: string;
}

export const defaultCircularRenderConfig: CircularRenderConfig = {
  wallColor: "#374151",
  wallWidth: 3,
  ballColor: "#dc2626",
  ballShadowColor: "rgba(0, 0, 0, 0.3)",
  startColor: "#22c55e",
  goalColor: "#3b82f6",
  backgroundColor: "#f9fafb",
  pathColor: "#ffffff",
};

/**
 * Render the circular maze
 */
export function renderCircularMaze(
  ctx: CanvasRenderingContext2D,
  maze: CircularMaze,
  centerX: number,
  centerY: number,
  config: CircularRenderConfig
): void {
  const { wallColor, wallWidth, goalColor, backgroundColor, pathColor } = config;

  // Clear and fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw path areas (white/light)
  ctx.fillStyle = pathColor;
  for (let ring = 0; ring < maze.rings; ring++) {
    const { innerRadius, outerRadius } = getRingRadii(maze, ring);
    for (let seg = 0; seg < maze.segmentsPerRing[ring]; seg++) {
      const { startAngle, endAngle } = getSegmentAngles(maze, ring, seg);

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Draw goal (center)
  ctx.beginPath();
  ctx.arc(centerX, centerY, maze.centerRadius, 0, Math.PI * 2);
  ctx.fillStyle = goalColor;
  ctx.globalAlpha = 0.3;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Draw start area (outer ring highlight)
  const outerRing = maze.rings - 1;
  const { outerRadius: startOuterR } = getRingRadii(maze, outerRing);
  ctx.beginPath();
  ctx.arc(centerX, centerY, startOuterR, 0, Math.PI * 2);
  ctx.arc(centerX, centerY, startOuterR - maze.ringWidth, 0, Math.PI * 2, true);
  ctx.fillStyle = config.startColor;
  ctx.globalAlpha = 0.15;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Draw walls
  ctx.strokeStyle = wallColor;
  ctx.lineWidth = wallWidth;
  ctx.lineCap = "round";

  // Draw outer boundary
  ctx.beginPath();
  ctx.arc(centerX, centerY, maze.totalRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Draw center boundary (only where there are walls)
  for (let seg = 0; seg < maze.segmentsPerRing[0]; seg++) {
    const cell = maze.cells[0][seg];
    if (cell.innerWall) {
      const { startAngle, endAngle } = getSegmentAngles(maze, 0, seg);
      ctx.beginPath();
      ctx.arc(centerX, centerY, maze.centerRadius, startAngle, endAngle);
      ctx.stroke();
    }
  }

  // Draw ring walls and segment walls
  for (let ring = 0; ring < maze.rings; ring++) {
    const { innerRadius, outerRadius } = getRingRadii(maze, ring);
    const segCount = maze.segmentsPerRing[ring];

    for (let seg = 0; seg < segCount; seg++) {
      const cell = maze.cells[ring][seg];
      const { startAngle, endAngle } = getSegmentAngles(maze, ring, seg);

      // Inner arc wall (between this ring and inner ring)
      if (cell.innerWall && ring > 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, innerRadius, startAngle, endAngle);
        ctx.stroke();
      }

      // Clockwise radial wall
      if (cell.cwWall) {
        const x1 = centerX + Math.cos(endAngle) * innerRadius;
        const y1 = centerY + Math.sin(endAngle) * innerRadius;
        const x2 = centerX + Math.cos(endAngle) * outerRadius;
        const y2 = centerY + Math.sin(endAngle) * outerRadius;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
  }
}

/**
 * Render the ball
 */
export function renderCircularBall(
  ctx: CanvasRenderingContext2D,
  ball: Ball,
  config: CircularRenderConfig
): void {
  const { ballColor, ballShadowColor } = config;

  // Draw shadow
  ctx.beginPath();
  ctx.arc(ball.x + 2, ball.y + 2, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ballShadowColor;
  ctx.fill();

  // Draw ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ballColor;
  ctx.fill();

  // Highlight
  ctx.beginPath();
  ctx.arc(
    ball.x - ball.radius * 0.3,
    ball.y - ball.radius * 0.3,
    ball.radius * 0.25,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fill();
}
