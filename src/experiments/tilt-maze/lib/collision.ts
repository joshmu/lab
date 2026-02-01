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

  // Check boundaries first
  if (cellX < 0 || cellX >= maze.width || cellY < 0 || cellY >= maze.height) {
    // Ball is outside maze bounds - find closest wall
    let normal: Vector2 = { x: 0, y: 0 };
    let penetration = 0;

    if (ball.x - ball.radius < 0) {
      normal = { x: -1, y: 0 };
      penetration = ball.radius - ball.x;
    } else if (ball.x + ball.radius > maze.width * cellSize) {
      normal = { x: 1, y: 0 };
      penetration = ball.x + ball.radius - maze.width * cellSize;
    } else if (ball.y - ball.radius < 0) {
      normal = { x: 0, y: -1 };
      penetration = ball.radius - ball.y;
    } else if (ball.y + ball.radius > maze.height * cellSize) {
      normal = { x: 0, y: 1 };
      penetration = ball.y + ball.radius - maze.height * cellSize;
    }

    if (penetration > 0) {
      return { collided: true, normal, penetration };
    }
  }

  // Clamp cell coordinates for edge cases
  const safeX = Math.max(0, Math.min(maze.width - 1, cellX));
  const safeY = Math.max(0, Math.min(maze.height - 1, cellY));

  const cell = getCell(maze, safeX, safeY);

  // Check collision with each wall (use <= and >= for edge cases)
  // North wall - normal points up (away from wall into cell)
  if (cell.north && localY <= ball.radius) {
    return {
      collided: true,
      normal: { x: 0, y: -1 },
      penetration: ball.radius - localY,
    };
  }

  // South wall - normal points down (away from wall into cell)
  if (cell.south && localY >= cellSize - ball.radius) {
    return {
      collided: true,
      normal: { x: 0, y: 1 },
      penetration: localY + ball.radius - cellSize,
    };
  }

  // West wall - normal points left (away from wall into cell)
  if (cell.west && localX <= ball.radius) {
    return {
      collided: true,
      normal: { x: -1, y: 0 },
      penetration: ball.radius - localX,
    };
  }

  // East wall - normal points right (away from wall into cell)
  if (cell.east && localX >= cellSize - ball.radius) {
    return {
      collided: true,
      normal: { x: 1, y: 0 },
      penetration: localX + ball.radius - cellSize,
    };
  }

  // Check adjacent cells for walls we might be hitting from the other side
  // This handles cases where ball is near cell boundary

  // Check cell to the north
  if (cellY > 0 && localY <= ball.radius) {
    const northCell = getCell(maze, safeX, cellY - 1);
    if (northCell.south) {
      return {
        collided: true,
        normal: { x: 0, y: -1 },
        penetration: ball.radius - localY,
      };
    }
  }

  // Check cell to the south
  if (cellY < maze.height - 1 && localY >= cellSize - ball.radius) {
    const southCell = getCell(maze, safeX, cellY + 1);
    if (southCell.north) {
      return {
        collided: true,
        normal: { x: 0, y: 1 },
        penetration: localY + ball.radius - cellSize,
      };
    }
  }

  // Check cell to the west
  if (cellX > 0 && localX <= ball.radius) {
    const westCell = getCell(maze, cellX - 1, safeY);
    if (westCell.east) {
      return {
        collided: true,
        normal: { x: -1, y: 0 },
        penetration: ball.radius - localX,
      };
    }
  }

  // Check cell to the east
  if (cellX < maze.width - 1 && localX >= cellSize - ball.radius) {
    const eastCell = getCell(maze, cellX + 1, safeY);
    if (eastCell.west) {
      return {
        collided: true,
        normal: { x: 1, y: 0 },
        penetration: localX + ball.radius - cellSize,
      };
    }
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

  // Push ball out of wall (in direction of normal)
  const newX = ball.x + normal.x * penetration;
  const newY = ball.y + normal.y * penetration;

  // Reflect velocity
  const dotProduct = ball.vx * normal.x + ball.vy * normal.y;

  // Only bounce if moving into the wall (dotProduct < 0 means moving against normal)
  let newVx = ball.vx;
  let newVy = ball.vy;

  if (dotProduct < 0) {
    newVx = ball.vx - 2 * dotProduct * normal.x;
    newVy = ball.vy - 2 * dotProduct * normal.y;

    // Apply elasticity (energy loss)
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
