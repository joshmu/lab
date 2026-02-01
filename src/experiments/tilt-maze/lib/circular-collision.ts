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

/** Small margin to prevent floating-point precision issues causing strobing */
const COLLISION_MARGIN = 0.5;

/**
 * Normalize angle to [0, 2*PI) range
 */
function normalizeAngle(angle: number): number {
  let a = angle % (2 * Math.PI);
  if (a < 0) a += 2 * Math.PI;
  return a;
}

/**
 * Check if an angle is within an arc segment, handling wraparound
 * Returns true if angle is between startAngle and endAngle
 */
function isAngleInArc(
  angle: number,
  startAngle: number,
  endAngle: number,
  tolerance: number = 0
): boolean {
  // Normalize all angles to [0, 2*PI)
  const a = normalizeAngle(angle);
  const start = normalizeAngle(startAngle);
  const end = normalizeAngle(endAngle);

  // Expand the arc by tolerance (for ball radius)
  const expandedStart = normalizeAngle(start - tolerance);
  const expandedEnd = normalizeAngle(end + tolerance);

  // Handle wraparound case
  if (expandedStart <= expandedEnd) {
    return a >= expandedStart && a <= expandedEnd;
  } else {
    // Arc crosses the 0/2*PI boundary
    return a >= expandedStart || a <= expandedEnd;
  }
}

/**
 * Check collision with a radial wall (spoke) at a given angle
 * Returns collision result with proper normal direction based on which side ball is on
 */
function checkRadialWallCollision(
  ball: Ball,
  centerX: number,
  centerY: number,
  wallAngle: number,
  innerRadius: number,
  outerRadius: number,
  ballDist: number
): CircularCollisionResult {
  // Wall direction vector (from center outward)
  const wallDirX = Math.cos(wallAngle);
  const wallDirY = Math.sin(wallAngle);

  // Vector from center to ball
  const toBallX = ball.x - centerX;
  const toBallY = ball.y - centerY;

  // The signed distance from ball to the wall LINE (not segment)
  // Perpendicular to wall: rotate wall direction 90 degrees counter-clockwise
  // This gives us (-sin(angle), cos(angle))
  // Positive distance = ball is counter-clockwise from wall
  // Negative distance = ball is clockwise from wall
  const perpX = -wallDirY; // -sin(wallAngle)
  const perpY = wallDirX; // cos(wallAngle)

  // Signed distance: positive if ball is on the counter-clockwise side
  const signedDist = toBallX * perpX + toBallY * perpY;
  const absDist = Math.abs(signedDist);

  // Check if ball is close enough to the wall line
  if (absDist >= ball.radius) {
    return { collided: false };
  }

  // Check if ball is within the radial extent of the wall (between inner and outer radius)
  // Use a small margin to catch edge cases
  const radialMargin = ball.radius * 0.5;
  if (ballDist < innerRadius - radialMargin || ballDist > outerRadius + radialMargin) {
    return { collided: false };
  }

  // Also check endpoint collisions (corners where radial wall meets arc walls)
  // Project ball onto wall line to find closest point
  const projDist = toBallX * wallDirX + toBallY * wallDirY;

  // If projection is outside wall segment, check distance to endpoints
  if (projDist < innerRadius || projDist > outerRadius) {
    // Clamp to wall segment
    const clampedProj = Math.max(innerRadius, Math.min(outerRadius, projDist));
    const closestX = centerX + wallDirX * clampedProj;
    const closestY = centerY + wallDirY * clampedProj;

    const toClosestX = ball.x - closestX;
    const toClosestY = ball.y - closestY;
    const distToClosest = Math.sqrt(toClosestX * toClosestX + toClosestY * toClosestY);

    if (distToClosest < ball.radius && distToClosest > 0.001) {
      // Collision with endpoint - normal points from endpoint to ball
      return {
        collided: true,
        normal: { x: toClosestX / distToClosest, y: toClosestY / distToClosest },
        penetration: ball.radius - distToClosest + COLLISION_MARGIN,
      };
    }
    return { collided: false };
  }

  // Normal collision with wall line segment
  // Normal points AWAY from wall, in the direction the ball is on
  // This ensures we always push the ball away from the wall, not through it
  const normalX = signedDist >= 0 ? perpX : -perpX;
  const normalY = signedDist >= 0 ? perpY : -perpY;

  return {
    collided: true,
    normal: { x: normalX, y: normalY },
    penetration: ball.radius - absDist + COLLISION_MARGIN,
  };
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
      penetration: dist + ball.radius - maze.totalRadius + COLLISION_MARGIN,
    };
  }

  // Check center boundary (goal area boundary)
  // Only collide if the ball is actually touching a segment with an inner wall
  if (dist - ball.radius < maze.centerRadius) {
    const ballAngleForCenter = Math.atan2(dy, dx);
    const segCount = maze.segmentsPerRing[0];

    // Find which segment the ball CENTER is in (no tolerance - use exact position)
    let normalizedAngle = ballAngleForCenter + Math.PI / 2;
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;
    const ballSegment = Math.floor((normalizedAngle / (2 * Math.PI)) * segCount) % segCount;

    // Only collide if the ball's segment has an inner wall
    if (maze.cells[0][ballSegment].innerWall) {
      return {
        collided: true,
        normal: { x: radialX, y: radialY }, // Push outward
        penetration: maze.centerRadius - (dist - ball.radius) + COLLISION_MARGIN,
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

  // Calculate angle of ball relative to center (in standard math coordinates)
  const ballAngle = Math.atan2(dy, dx);

  // Calculate angular tolerance based on ball radius at current distance
  // This accounts for how much arc the ball's radius spans at this distance
  const angularTolerance = dist > 0 ? ball.radius / dist : 0;

  // Check inner arc wall (toward center)
  // Only collide if ball is within the angular span of this segment's wall
  if (cell.innerWall && dist - ball.radius < innerRadius) {
    if (isAngleInArc(ballAngle, startAngle, endAngle, angularTolerance)) {
      return {
        collided: true,
        normal: { x: radialX, y: radialY }, // Push outward
        penetration: innerRadius - (dist - ball.radius) + COLLISION_MARGIN,
      };
    }
  }

  // Check outer arc wall (away from center) - only for non-outermost ring
  // Only collide if ball is within the angular span of this segment's wall
  if (ring < maze.rings - 1 && cell.outerWall && dist + ball.radius > outerRadius) {
    if (isAngleInArc(ballAngle, startAngle, endAngle, angularTolerance)) {
      return {
        collided: true,
        normal: { x: -radialX, y: -radialY }, // Push inward
        penetration: dist + ball.radius - outerRadius + COLLISION_MARGIN,
      };
    }
  }

  // Check adjacent segments for arc walls the ball might be touching
  // This handles cases where ball straddles segment boundaries
  const segCount = maze.segmentsPerRing[ring];
  const adjacentSegments = [
    (segment + 1) % segCount, // clockwise neighbor
    (segment - 1 + segCount) % segCount, // counter-clockwise neighbor
  ];

  for (const adjSeg of adjacentSegments) {
    const adjCell = maze.cells[ring][adjSeg];
    const { startAngle: adjStart, endAngle: adjEnd } = getSegmentAngles(
      maze,
      ring,
      adjSeg
    );

    // Check adjacent cell's inner wall
    // Skip for ring 0 - the center boundary check already handles goal entry correctly
    if (ring > 0 && adjCell.innerWall && dist - ball.radius < innerRadius) {
      if (isAngleInArc(ballAngle, adjStart, adjEnd, angularTolerance)) {
        return {
          collided: true,
          normal: { x: radialX, y: radialY },
          penetration: innerRadius - (dist - ball.radius) + COLLISION_MARGIN,
        };
      }
    }

    // Check adjacent cell's outer wall
    if (ring < maze.rings - 1 && adjCell.outerWall && dist + ball.radius > outerRadius) {
      if (isAngleInArc(ballAngle, adjStart, adjEnd, angularTolerance)) {
        return {
          collided: true,
          normal: { x: -radialX, y: -radialY },
          penetration: dist + ball.radius - outerRadius + COLLISION_MARGIN,
        };
      }
    }
  }

  // Check radial walls (clockwise and counter-clockwise)
  // Clockwise wall (at endAngle)
  if (cell.cwWall) {
    const collision = checkRadialWallCollision(
      ball,
      centerX,
      centerY,
      endAngle,
      innerRadius,
      outerRadius,
      dist
    );
    if (collision.collided) {
      return collision;
    }
  }

  // Counter-clockwise wall (at startAngle)
  if (cell.ccwWall) {
    const collision = checkRadialWallCollision(
      ball,
      centerX,
      centerY,
      startAngle,
      innerRadius,
      outerRadius,
      dist
    );
    if (collision.collided) {
      return collision;
    }
  }

  // Also check radial walls of adjacent segments (handles balls near segment boundaries)
  for (const adjSeg of adjacentSegments) {
    const adjCell = maze.cells[ring][adjSeg];
    const { startAngle: adjStart, endAngle: adjEnd } = getSegmentAngles(
      maze,
      ring,
      adjSeg
    );

    if (adjCell.cwWall) {
      const collision = checkRadialWallCollision(
        ball,
        centerX,
        centerY,
        adjEnd,
        innerRadius,
        outerRadius,
        dist
      );
      if (collision.collided) {
        return collision;
      }
    }

    if (adjCell.ccwWall) {
      const collision = checkRadialWallCollision(
        ball,
        centerX,
        centerY,
        adjStart,
        innerRadius,
        outerRadius,
        dist
      );
      if (collision.collided) {
        return collision;
      }
    }
  }

  return { collided: false };
}

/**
 * Resolve a collision by bouncing the ball
 * @param reflectVelocity - if false, only correct position without reflecting velocity
 *                          (useful for secondary collision iterations to prevent oscillation)
 */
export function resolveCircularCollision(
  ball: Ball,
  collision: CircularCollisionResult,
  elasticity: number,
  reflectVelocity: boolean = true
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

  // Only reflect velocity if moving into the wall AND reflectVelocity is true
  if (reflectVelocity && dotProduct < 0) {
    // Decompose velocity into normal and tangent components
    // v_normal = (v dot n) * n (component toward/away from wall)
    const vnX = dotProduct * normal.x;
    const vnY = dotProduct * normal.y;

    // v_tangent = v - v_normal (component parallel to wall, preserved)
    const vtX = ball.vx - vnX;
    const vtY = ball.vy - vnY;

    // Reflect only the normal component and apply elasticity to it
    // v' = v_tangent - elasticity * v_normal
    // This preserves tangential velocity (sliding) while bouncing the normal component
    newVx = vtX - elasticity * vnX;
    newVy = vtY - elasticity * vnY;
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
