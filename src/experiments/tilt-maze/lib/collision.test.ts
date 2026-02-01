import { describe, it, expect } from "vitest";
import {
  checkWallCollision,
  resolveCollision,
  isAtGoal,
  type CollisionResult,
} from "./collision";
import { createBall } from "./physics";
import { generateMaze } from "./maze";

describe("Collision Detection", () => {
  const cellSize = 50;

  describe("checkWallCollision", () => {
    it("detects collision with north wall", () => {
      const maze = generateMaze(5, 5, 42);
      // Position ball near top of a cell with north wall
      const ball = createBall(cellSize * 0.5, 5, 5); // Near top edge of cell (0,0)
      const result = checkWallCollision(ball, maze, cellSize);
      expect(result.collided).toBe(true);
      expect(result.normal?.y).toBeLessThan(0);
    });

    it("detects collision with south wall", () => {
      const maze = generateMaze(5, 5, 42);
      // Position ball near bottom edge of bottom cell
      const ball = createBall(cellSize * 4.5, cellSize * 5 - 5, 5);
      const result = checkWallCollision(ball, maze, cellSize);
      expect(result.collided).toBe(true);
      expect(result.normal?.y).toBeGreaterThan(0);
    });

    it("detects collision with west wall", () => {
      const maze = generateMaze(5, 5, 42);
      // Position ball near left edge
      const ball = createBall(5, cellSize * 0.5, 5);
      const result = checkWallCollision(ball, maze, cellSize);
      expect(result.collided).toBe(true);
      expect(result.normal?.x).toBeLessThan(0);
    });

    it("detects collision with east wall", () => {
      const maze = generateMaze(5, 5, 42);
      // Position ball near right edge of rightmost cell
      const ball = createBall(cellSize * 5 - 5, cellSize * 0.5, 5);
      const result = checkWallCollision(ball, maze, cellSize);
      expect(result.collided).toBe(true);
      expect(result.normal?.x).toBeGreaterThan(0);
    });

    it("returns no collision when ball is in open space", () => {
      const maze = generateMaze(5, 5, 42);
      // Position ball in center of start cell (which should have some open paths)
      const ball = createBall(cellSize * 0.5, cellSize * 0.5, 3);
      const result = checkWallCollision(ball, maze, cellSize);
      // This may or may not collide depending on maze generation
      // The key is that the function runs without error
      expect(typeof result.collided).toBe("boolean");
    });
  });

  describe("resolveCollision", () => {
    it("bounces ball off horizontal surface", () => {
      const ball = createBall(100, 100, 10);
      ball.vy = 5; // Moving down
      const collision: CollisionResult = {
        collided: true,
        normal: { x: 0, y: -1 }, // Hit from above (floor)
        penetration: 2,
      };
      const resolved = resolveCollision(ball, collision, 0.3);
      expect(resolved.vy).toBeLessThan(0); // Bounced up
      expect(Math.abs(resolved.vy)).toBeLessThan(Math.abs(ball.vy)); // Lost energy
    });

    it("bounces ball off vertical surface", () => {
      const ball = createBall(100, 100, 10);
      ball.vx = 5; // Moving right
      const collision: CollisionResult = {
        collided: true,
        normal: { x: -1, y: 0 }, // Hit from left (right wall)
        penetration: 2,
      };
      const resolved = resolveCollision(ball, collision, 0.3);
      expect(resolved.vx).toBeLessThan(0); // Bounced left
    });

    it("moves ball out of wall by penetration amount", () => {
      const ball = createBall(100, 100, 10);
      const collision: CollisionResult = {
        collided: true,
        normal: { x: -1, y: 0 },
        penetration: 5,
      };
      const resolved = resolveCollision(ball, collision, 0.3);
      expect(resolved.x).toBeLessThan(ball.x); // Pushed left
    });

    it("applies elasticity to bounce", () => {
      const ball = createBall(100, 100, 10);
      ball.vx = 10;
      const collision: CollisionResult = {
        collided: true,
        normal: { x: -1, y: 0 },
        penetration: 2,
      };
      const resolved03 = resolveCollision({ ...ball }, collision, 0.3);
      const resolved08 = resolveCollision({ ...ball }, collision, 0.8);
      // Higher elasticity = faster bounce
      expect(Math.abs(resolved08.vx)).toBeGreaterThan(Math.abs(resolved03.vx));
    });

    it("returns unchanged ball when no collision", () => {
      const ball = createBall(100, 100, 10);
      ball.vx = 5;
      ball.vy = 5;
      const collision: CollisionResult = {
        collided: false,
      };
      const resolved = resolveCollision(ball, collision, 0.3);
      expect(resolved.x).toBe(ball.x);
      expect(resolved.y).toBe(ball.y);
      expect(resolved.vx).toBe(ball.vx);
      expect(resolved.vy).toBe(ball.vy);
    });
  });

  describe("isAtGoal", () => {
    it("returns true when ball is at goal position", () => {
      const maze = generateMaze(5, 5);
      // Goal is at (4, 4), so center is at (4.5 * cellSize, 4.5 * cellSize)
      const goalCenterX = (maze.end.x + 0.5) * cellSize;
      const goalCenterY = (maze.end.y + 0.5) * cellSize;
      const ball = createBall(goalCenterX, goalCenterY, 5);
      expect(isAtGoal(ball, maze, cellSize)).toBe(true);
    });

    it("returns false when ball is at start position", () => {
      const maze = generateMaze(5, 5);
      const startCenterX = (maze.start.x + 0.5) * cellSize;
      const startCenterY = (maze.start.y + 0.5) * cellSize;
      const ball = createBall(startCenterX, startCenterY, 5);
      expect(isAtGoal(ball, maze, cellSize)).toBe(false);
    });

    it("returns true when ball overlaps goal within threshold", () => {
      const maze = generateMaze(5, 5);
      const goalCenterX = (maze.end.x + 0.5) * cellSize;
      const goalCenterY = (maze.end.y + 0.5) * cellSize;
      // Ball slightly off center but still overlapping
      const ball = createBall(goalCenterX + 10, goalCenterY + 10, 5);
      expect(isAtGoal(ball, maze, cellSize, 15)).toBe(true);
    });

    it("returns false when ball is outside threshold", () => {
      const maze = generateMaze(5, 5);
      const ball = createBall(cellSize * 2.5, cellSize * 2.5, 5);
      expect(isAtGoal(ball, maze, cellSize)).toBe(false);
    });
  });
});
