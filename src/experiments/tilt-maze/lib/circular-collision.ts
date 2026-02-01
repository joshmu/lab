/**
 * Collision detection for circular mazes
 * Handles arc walls and radial walls in polar coordinate system
 */

import { type Ball } from "./physics";
import {
  type CircularMaze,
  getPositionCell,
  getSegmentAngles,
  getRingRadii,
} from "./circular-maze";

export interface Vector2 {
  x: number;
  y: number;
}

export interface CircularCollisionResult {
  collided: boolean;
  normal?: Vector2;
  penetration?: number;
}

/**
 * Check collision with circular maze walls
 * Uses multiple substeps to prevent tunneling through walls
 */
export function checkCircularWallCollision(
  ball: Ball,
  maze: CircularMaze,
  centerX: number,
  centerY: number
): CircularCollisionResult {
  const dx = ball.x - centerX;
  const dy = ball.y - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Normalized radial direction (pointing outward from center)
  const radialX = dist > 0 ? dx / dist : 0;
  const radialY = dist > 0 ? dy / dist : 0;

  // Check outer boundary
  if (dist + ball.radius > maze.totalRadius) {
    return {
      collided: true,
      normal: { x: -radialX, y: -radialY }, // Push inward
      penetration: dist + ball.radius - maze.totalRadius,
    };
  }

  // Check center boundary (goal area boundary)
  // Only collide if the innermost ring has walls
  if (dist - ball.radius < maze.centerRadius) {
    // Find which segment we're in relative to innermost ring
    let angle = Math.atan2(dy, dx) + Math.PI / 2;
    if (angle < 0) angle += 2 * Math.PI;
    const segCount = maze.segmentsPerRing[0];
    const segment = Math.floor((angle / (2 * Math.PI)) * segCount) % segCount;

    // Check if this segment has an inner wall
    if (maze.cells[0][segment].innerWall) {
      return {
        collided: true,
        normal: { x: radialX, y: radialY }, // Push outward
        penetration: maze.centerRadius - (dist - ball.radius),
      };
    }
  }

  // Find which cell the ball is in
  const cellInfo = getPositionCell(ball.x, ball.y, maze, centerX, centerY);
  if (!cellInfo) {
    return { collided: false };
  }

  const { ring, segment } = cellInfo;
  const cell = maze.cells[ring][segment];
  const { innerRadius, outerRadius } = getRingRadii(maze, ring);
  const { startAngle, endAngle } = getSegmentAngles(maze, ring, segment);

  // Calculate angle of ball relative to center
  let ballAngle = Math.atan2(dy, dx) + Math.PI / 2;
  if (ballAngle < 0) ballAngle += 2 * Math.PI;

  // Check inner arc wall (toward center)
  if (cell.innerWall && dist - ball.radius < innerRadius) {
    return {
      collided: true,
      normal: { x: radialX, y: radialY }, // Push outward
      penetration: innerRadius - (dist - ball.radius),
    };
  }

  // Check outer arc wall (away from center) - only for non-outermost ring
  if (ring < maze.rings - 1 && cell.outerWall && dist + ball.radius > outerRadius) {
    return {
      collided: true,
      normal: { x: -radialX, y: -radialY }, // Push inward
      penetration: dist + ball.radius - outerRadius,
    };
  }

  // Check radial walls (clockwise and counter-clockwise)
  // Clockwise wall (at endAngle)
  if (cell.cwWall) {
    // Point on wall at same radius
    const wallPointX = centerX + Math.cos(endAngle) * dist;
    const wallPointY = centerY + Math.sin(endAngle) * dist;

    // Distance from ball to wall line
    const toBallX = ball.x - wallPointX;
    const toBallY = ball.y - wallPointY;

    // Normal to wall (pointing counter-clockwise, into the cell)
    const wallNormalX = -Math.sin(endAngle);
    const wallNormalY = Math.cos(endAngle);

    const distToWall = toBallX * wallNormalX + toBallY * wallNormalY;

    if (distToWall < ball.radius && distToWall > -ball.radius * 2) {
      // Check if we're within the arc segment radially
      if (dist >= innerRadius && dist <= outerRadius) {
        return {
          collided: true,
          normal: { x: wallNormalX, y: wallNormalY }, // Push away from wall
          penetration: ball.radius - distToWall,
        };
      }
    }
  }

  // Counter-clockwise wall (at startAngle) - check neighbor's ccwWall
  if (cell.ccwWall) {
    // Point on wall at same radius
    const wallPointX = centerX + Math.cos(startAngle) * dist;
    const wallPointY = centerY + Math.sin(startAngle) * dist;

    // Distance from ball to wall line
    const toBallX = ball.x - wallPointX;
    const toBallY = ball.y - wallPointY;

    // Normal to wall (pointing clockwise, into the cell)
    const wallNormalX = Math.sin(startAngle);
    const wallNormalY = -Math.cos(startAngle);

    const distToWall = toBallX * wallNormalX + toBallY * wallNormalY;

    if (distToWall < ball.radius && distToWall > -ball.radius * 2) {
      // Check if we're within the arc segment radially
      if (dist >= innerRadius && dist <= outerRadius) {
        return {
          collided: true,
          normal: { x: wallNormalX, y: wallNormalY }, // Push away from wall
          penetration: ball.radius - distToWall,
        };
      }
    }
  }

  return { collided: false };
}

/**
 * Resolve a collision by bouncing the ball
 */
export function resolveCircularCollision(
  ball: Ball,
  collision: CircularCollisionResult,
  elasticity: number
): Ball {
  if (!collision.collided || !collision.normal || !collision.penetration) {
    return ball;
  }

  const { normal, penetration } = collision;

  // Push ball out of wall
  const newX = ball.x + normal.x * penetration;
  const newY = ball.y + normal.y * penetration;

  // Calculate dot product to check if ball is moving into wall
  const dotProduct = ball.vx * normal.x + ball.vy * normal.y;

  let newVx = ball.vx;
  let newVy = ball.vy;

  // Only reflect velocity if moving into the wall
  if (dotProduct < 0) {
    // Reflect: v' = v - 2(v·n)n
    newVx = ball.vx - 2 * dotProduct * normal.x;
    newVy = ball.vy - 2 * dotProduct * normal.y;

    // Apply elasticity
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
 * Check if ball has reached the goal (center)
 */
export function isAtCircularGoal(
  ball: Ball,
  maze: CircularMaze,
  centerX: number,
  centerY: number
): boolean {
  const dx = ball.x - centerX;
  const dy = ball.y - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Ball is in goal when center is within center area
  return dist < maze.centerRadius * 0.7;
}

/**
 * Check collisions with substeps to prevent tunneling
 */
export function checkCircularCollisionWithSubsteps(
  ball: Ball,
  prevBall: Ball,
  maze: CircularMaze,
  centerX: number,
  centerY: number,
  substeps: number = 4
): CircularCollisionResult {
  // First check current position
  const currentCollision = checkCircularWallCollision(ball, maze, centerX, centerY);
  if (currentCollision.collided) {
    return currentCollision;
  }

  // Check intermediate positions to catch tunneling
  for (let i = 1; i < substeps; i++) {
    const t = i / substeps;
    const interpBall: Ball = {
      ...ball,
      x: prevBall.x + (ball.x - prevBall.x) * t,
      y: prevBall.y + (ball.y - prevBall.y) * t,
    };

    const collision = checkCircularWallCollision(interpBall, maze, centerX, centerY);
    if (collision.collided) {
      return collision;
    }
  }

  return { collided: false };
}
