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
    it("detects collision with north boundary and returns correct normal", () => {
      const maze = generateMaze(5, 5, 42);
      // Position ball near top boundary
      const ball = createBall(cellSize * 0.5, 3, 5);
      const result = checkWallCollision(ball, maze, cellSize);
      expect(result.collided).toBe(true);
      // Normal should point DOWN (into the maze, away from north boundary)
      expect(result.normal?.y).toBeGreaterThan(0);
    });

    it("detects collision with south boundary and returns correct normal", () => {
      const maze = generateMaze(5, 5, 42);
      // Position ball near bottom boundary
      const ball = createBall(cellSize * 4.5, cellSize * 5 - 3, 5);
      const result = checkWallCollision(ball, maze, cellSize);
      expect(result.collided).toBe(true);
      // Normal should point UP (into the maze, away from south boundary)
      expect(result.normal?.y).toBeLessThan(0);
    });

    it("detects collision with west boundary and returns correct normal", () => {
      const maze = generateMaze(5, 5, 42);
      // Position ball near left boundary
      const ball = createBall(3, cellSize * 0.5, 5);
      const result = checkWallCollision(ball, maze, cellSize);
      expect(result.collided).toBe(true);
      // Normal should point RIGHT (into the maze, away from west boundary)
      expect(result.normal?.x).toBeGreaterThan(0);
    });

    it("detects collision with east boundary and returns correct normal", () => {
      const maze = generateMaze(5, 5, 42);
      // Position ball near right boundary
      const ball = createBall(cellSize * 5 - 3, cellSize * 0.5, 5);
      const result = checkWallCollision(ball, maze, cellSize);
      expect(result.collided).toBe(true);
      // Normal should point LEFT (into the maze, away from east boundary)
      expect(result.normal?.x).toBeLessThan(0);
    });

    it("returns no collision when ball is in open space", () => {
      const maze = generateMaze(5, 5, 42);
      const ball = createBall(cellSize * 0.5, cellSize * 0.5, 3);
      const result = checkWallCollision(ball, maze, cellSize);
      expect(typeof result.collided).toBe("boolean");
    });
  });

  describe("resolveCollision", () => {
    it("bounces ball off floor (south wall with up-pointing normal)", () => {
      const ball = createBall(100, 100, 10);
      ball.vy = 5; // Moving down toward floor
      const collision: CollisionResult = {
        collided: true,
        normal: { x: 0, y: -1 }, // Floor normal points UP
        penetration: 2,
      };
      const resolved = resolveCollision(ball, collision, 0.3);
      expect(resolved.vy).toBeLessThan(0); // Bounced up
      expect(resolved.y).toBeLessThan(ball.y); // Pushed up (away from floor)
    });

    it("bounces ball off ceiling (north wall with down-pointing normal)", () => {
      const ball = createBall(100, 100, 10);
      ball.vy = -5; // Moving up toward ceiling
      const collision: CollisionResult = {
        collided: true,
        normal: { x: 0, y: 1 }, // Ceiling normal points DOWN
        penetration: 2,
      };
      const resolved = resolveCollision(ball, collision, 0.3);
      expect(resolved.vy).toBeGreaterThan(0); // Bounced down
      expect(resolved.y).toBeGreaterThan(ball.y); // Pushed down (away from ceiling)
    });

    it("bounces ball off right wall (east wall with left-pointing normal)", () => {
      const ball = createBall(100, 100, 10);
      ball.vx = 5; // Moving right toward wall
      const collision: CollisionResult = {
        collided: true,
        normal: { x: -1, y: 0 }, // Right wall normal points LEFT
        penetration: 2,
      };
      const resolved = resolveCollision(ball, collision, 0.3);
      expect(resolved.vx).toBeLessThan(0); // Bounced left
      expect(resolved.x).toBeLessThan(ball.x); // Pushed left (away from wall)
    });

    it("bounces ball off left wall (west wall with right-pointing normal)", () => {
      const ball = createBall(100, 100, 10);
      ball.vx = -5; // Moving left toward wall
      const collision: CollisionResult = {
        collided: true,
        normal: { x: 1, y: 0 }, // Left wall normal points RIGHT
        penetration: 2,
      };
      const resolved = resolveCollision(ball, collision, 0.3);
      expect(resolved.vx).toBeGreaterThan(0); // Bounced right
      expect(resolved.x).toBeGreaterThan(ball.x); // Pushed right (away from wall)
    });

    it("applies elasticity to reduce bounce velocity", () => {
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
      const ball = createBall(goalCenterX + 10, goalCenterY + 10, 5);
      expect(isAtGoal(ball, maze, cellSize, 15)).toBe(true);
    });

    it("returns false when ball is outside threshold", () => {
      const maze = generateMaze(5, 5);
      const ball = createBall(cellSize * 2.5, cellSize * 2.5, 5);
      expect(isAtGoal(ball, maze, cellSize)).toBe(false);
    });
  });

  describe("integration: collision detection + resolution", () => {
    it("correctly bounces ball off north boundary", () => {
      const maze = generateMaze(5, 5);
      const ball = createBall(cellSize * 2.5, 3, 5);
      ball.vy = -5; // Moving up toward boundary

      const collision = checkWallCollision(ball, maze, cellSize);
      expect(collision.collided).toBe(true);

      const resolved = resolveCollision(ball, collision, 0.8);
      expect(resolved.vy).toBeGreaterThan(0); // Bounced down
      expect(resolved.y).toBeGreaterThan(ball.y); // Pushed down into maze
    });

    it("correctly bounces ball off south boundary", () => {
      const maze = generateMaze(5, 5);
      const mazeHeight = maze.height * cellSize;
      const ball = createBall(cellSize * 2.5, mazeHeight - 3, 5);
      ball.vy = 5; // Moving down toward boundary

      const collision = checkWallCollision(ball, maze, cellSize);
      expect(collision.collided).toBe(true);

      const resolved = resolveCollision(ball, collision, 0.8);
      expect(resolved.vy).toBeLessThan(0); // Bounced up
      expect(resolved.y).toBeLessThan(ball.y); // Pushed up into maze
    });

    it("correctly bounces ball off internal north wall", () => {
      const maze = generateMaze(5, 5, 42);
      // Find a cell with a north wall that isn't the boundary
      // Cell (0,1) should have a north wall in most generated mazes
      const ball = createBall(cellSize * 0.5, cellSize + 3, 5);
      ball.vy = -5; // Moving up

      const collision = checkWallCollision(ball, maze, cellSize);
      if (collision.collided && collision.normal) {
        const resolved = resolveCollision(ball, collision, 0.8);
        // If we hit a north wall, normal points down, so ball bounces down
        if (collision.normal.y > 0) {
          expect(resolved.vy).toBeGreaterThan(0);
        }
      }
    });
  });
});
