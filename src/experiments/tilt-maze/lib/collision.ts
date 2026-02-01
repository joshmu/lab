/**
 * Collision detection and resolution for ball-maze interactions
 */

import { type Ball } from "./physics";
import { type Maze, getCell } from "./maze";

export interface Vector2 {
  x: number;
  y: number;
}

export interface CollisionResult {
  collided: boolean;
  normal?: Vector2;
  penetration?: number;
}

/**
 * Check if the ball collides with any walls in the maze
 * Normal convention: points INTO the cell (away from wall surface, into free space)
 */
export function checkWallCollision(
  ball: Ball,
  maze: Maze,
  cellSize: number
): CollisionResult {
  // Determine which cell the ball is in
  const cellX = Math.floor(ball.x / cellSize);
  const cellY = Math.floor(ball.y / cellSize);

  // Position within the cell (0 to cellSize)
  const localX = ball.x - cellX * cellSize;
  const localY = ball.y - cellY * cellSize;

  // Check maze boundaries first
  const mazeWidth = maze.width * cellSize;
  const mazeHeight = maze.height * cellSize;

  // Left boundary
  if (ball.x - ball.radius < 0) {
    return {
      collided: true,
      normal: { x: 1, y: 0 }, // Push right (into maze)
      penetration: ball.radius - ball.x,
    };
  }
  // Right boundary
  if (ball.x + ball.radius > mazeWidth) {
    return {
      collided: true,
      normal: { x: -1, y: 0 }, // Push left (into maze)
      penetration: ball.x + ball.radius - mazeWidth,
    };
  }
  // Top boundary
  if (ball.y - ball.radius < 0) {
    return {
      collided: true,
      normal: { x: 0, y: 1 }, // Push down (into maze)
      penetration: ball.radius - ball.y,
    };
  }
  // Bottom boundary
  if (ball.y + ball.radius > mazeHeight) {
    return {
      collided: true,
      normal: { x: 0, y: -1 }, // Push up (into maze)
      penetration: ball.y + ball.radius - mazeHeight,
    };
  }

  // Clamp cell coordinates for safety
  const safeX = Math.max(0, Math.min(maze.width - 1, cellX));
  const safeY = Math.max(0, Math.min(maze.height - 1, cellY));

  const cell = getCell(maze, safeX, safeY);

  // Check collision with each wall
  // North wall (at top of cell) - normal points DOWN into cell
  if (cell.north && localY <= ball.radius) {
    return {
      collided: true,
      normal: { x: 0, y: 1 }, // Push down (away from north wall)
      penetration: ball.radius - localY,
    };
  }

  // South wall (at bottom of cell) - normal points UP into cell
  if (cell.south && localY >= cellSize - ball.radius) {
    return {
      collided: true,
      normal: { x: 0, y: -1 }, // Push up (away from south wall)
      penetration: localY + ball.radius - cellSize,
    };
  }

  // West wall (at left of cell) - normal points RIGHT into cell
  if (cell.west && localX <= ball.radius) {
    return {
      collided: true,
      normal: { x: 1, y: 0 }, // Push right (away from west wall)
      penetration: ball.radius - localX,
    };
  }

  // East wall (at right of cell) - normal points LEFT into cell
  if (cell.east && localX >= cellSize - ball.radius) {
    return {
      collided: true,
      normal: { x: -1, y: 0 }, // Push left (away from east wall)
      penetration: localX + ball.radius - cellSize,
    };
  }

  return { collided: false };
}

/**
 * Resolve a collision by bouncing the ball
 * Normal convention: points away from wall surface (into free space)
 */
export function resolveCollision(
  ball: Ball,
  collision: CollisionResult,
  elasticity: number
): Ball {
  if (!collision.collided || !collision.normal || !collision.penetration) {
    return ball;
  }

  const { normal, penetration } = collision;

  // Push ball out of wall (in direction of normal - away from wall)
  const newX = ball.x + normal.x * penetration;
  const newY = ball.y + normal.y * penetration;

  // Calculate dot product to check if ball is moving into wall
  const dotProduct = ball.vx * normal.x + ball.vy * normal.y;

  let newVx = ball.vx;
  let newVy = ball.vy;

  // Only reflect velocity if moving into the wall (dotProduct < 0)
  // dotProduct < 0 means velocity is opposite to normal (moving toward wall)
  if (dotProduct < 0) {
    // Reflect: v' = v - 2(v·n)n
    newVx = ball.vx - 2 * dotProduct * normal.x;
    newVy = ball.vy - 2 * dotProduct * normal.y;

    // Apply elasticity (energy loss on bounce)
    newVx *= elasticity;
    newVy *= elasticity;
  }

  return {
    ...ball,
    x: newX,
    y: newY,
    vx: newVx,
    vy: newVy,
  };
}

/**
 * Check if the ball has reached the goal
 */
export function isAtGoal(
  ball: Ball,
  maze: Maze,
  cellSize: number,
  threshold: number = cellSize * 0.4
): boolean {
  const goalCenterX = (maze.end.x + 0.5) * cellSize;
  const goalCenterY = (maze.end.y + 0.5) * cellSize;

  const dx = ball.x - goalCenterX;
  const dy = ball.y - goalCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance < threshold;
}
