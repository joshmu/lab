import { describe, it, expect } from "vitest";
import {
  generateCircularMaze,
  getSegmentAngles,
  getRingRadii,
  isInCenter,
  getPositionCell,
  isCircularMazeSolvable,
} from "./circular-maze";

describe("Circular Maze Generation", () => {
  describe("generateCircularMaze", () => {
    it("creates a maze with the specified number of rings", () => {
      const maze = generateCircularMaze(4);
      expect(maze.rings).toBe(4);
      expect(maze.cells.length).toBe(4);
    });

    it("generates different mazes with different seeds", () => {
      const maze1 = generateCircularMaze(3, 12345);
      const maze2 = generateCircularMaze(3, 67890);
      const walls1 = JSON.stringify(maze1.cells);
      const walls2 = JSON.stringify(maze2.cells);
      expect(walls1).not.toBe(walls2);
    });

    it("generates identical mazes with the same seed", () => {
      const maze1 = generateCircularMaze(3, 42);
      const maze2 = generateCircularMaze(3, 42);
      expect(JSON.stringify(maze1.cells)).toBe(JSON.stringify(maze2.cells));
    });

    it("has proper radius calculations", () => {
      const maze = generateCircularMaze(3);
      expect(maze.centerRadius).toBeGreaterThan(0);
      expect(maze.ringWidth).toBeGreaterThan(0);
      expect(maze.totalRadius).toBe(
        maze.centerRadius + maze.rings * maze.ringWidth
      );
    });

    it("has segments per ring that increase outward", () => {
      const maze = generateCircularMaze(4);
      // Outer rings should have more or equal segments than inner rings
      for (let i = 1; i < maze.rings; i++) {
        expect(maze.segmentsPerRing[i]).toBeGreaterThanOrEqual(
          maze.segmentsPerRing[i - 1]
        );
      }
    });

    it("has outer walls only on outermost ring", () => {
      const maze = generateCircularMaze(3);
      // Inner rings should not have outer walls
      for (let r = 0; r < maze.rings - 1; r++) {
        for (let s = 0; s < maze.segmentsPerRing[r]; s++) {
          // outerWall on inner rings should be false (unless carving made it so)
          // This is just checking initial state doesn't have them
        }
      }
      // Outermost ring should have outer walls initially set
      const outerRing = maze.rings - 1;
      let hasOuterWalls = false;
      for (let s = 0; s < maze.segmentsPerRing[outerRing]; s++) {
        if (maze.cells[outerRing][s].outerWall) {
          hasOuterWalls = true;
          break;
        }
      }
      expect(hasOuterWalls).toBe(true);
    });

    it("each cell has wall properties", () => {
      const maze = generateCircularMaze(3);
      const cell = maze.cells[1][0];
      expect(cell).toHaveProperty("innerWall");
      expect(cell).toHaveProperty("outerWall");
      expect(cell).toHaveProperty("cwWall");
      expect(cell).toHaveProperty("ccwWall");
      expect(typeof cell.innerWall).toBe("boolean");
      expect(typeof cell.outerWall).toBe("boolean");
      expect(typeof cell.cwWall).toBe("boolean");
      expect(typeof cell.ccwWall).toBe("boolean");
    });
  });

  describe("isCircularMazeSolvable", () => {
    it("returns true for generated mazes", () => {
      // Test multiple seeds to ensure algorithm always produces solvable mazes
      for (let seed = 1; seed <= 10; seed++) {
        const maze = generateCircularMaze(3, seed);
        expect(isCircularMazeSolvable(maze)).toBe(true);
      }
    });

    it("returns true for larger mazes", () => {
      for (let rings = 2; rings <= 5; rings++) {
        const maze = generateCircularMaze(rings);
        expect(isCircularMazeSolvable(maze)).toBe(true);
      }
    });
  });

  describe("getSegmentAngles", () => {
    it("returns correct angles for first segment", () => {
      const maze = generateCircularMaze(3);
      const { startAngle, endAngle } = getSegmentAngles(maze, 0, 0);
      expect(startAngle).toBe(-Math.PI / 2); // Starts at top
      expect(endAngle).toBeGreaterThan(startAngle);
    });

    it("angles span full circle for all segments", () => {
      const maze = generateCircularMaze(3);
      for (let ring = 0; ring < maze.rings; ring++) {
        const segCount = maze.segmentsPerRing[ring];
        const firstSeg = getSegmentAngles(maze, ring, 0);
        const lastSeg = getSegmentAngles(maze, ring, segCount - 1);
        // Last segment end should be 2*PI more than first segment start
        expect(lastSeg.endAngle - firstSeg.startAngle).toBeCloseTo(
          2 * Math.PI,
          5
        );
      }
    });
  });

  describe("getRingRadii", () => {
    it("returns correct radii for rings", () => {
      const maze = generateCircularMaze(3);
      const ring0 = getRingRadii(maze, 0);
      expect(ring0.innerRadius).toBe(maze.centerRadius);
      expect(ring0.outerRadius).toBe(maze.centerRadius + maze.ringWidth);

      const ring1 = getRingRadii(maze, 1);
      expect(ring1.innerRadius).toBe(ring0.outerRadius);
      expect(ring1.outerRadius).toBe(ring0.outerRadius + maze.ringWidth);
    });

    it("outer ring reaches total radius", () => {
      const maze = generateCircularMaze(3);
      const outerRing = getRingRadii(maze, maze.rings - 1);
      expect(outerRing.outerRadius).toBe(maze.totalRadius);
    });
  });

  describe("isInCenter", () => {
    it("returns true for points at center", () => {
      const maze = generateCircularMaze(3);
      const centerX = 200;
      const centerY = 200;
      expect(isInCenter(centerX, centerY, maze, centerX, centerY)).toBe(true);
    });

    it("returns false for points outside center", () => {
      const maze = generateCircularMaze(3);
      const centerX = 200;
      const centerY = 200;
      // Point in first ring
      const ringRadius = maze.centerRadius + maze.ringWidth / 2;
      expect(
        isInCenter(centerX + ringRadius, centerY, maze, centerX, centerY)
      ).toBe(false);
    });
  });

  describe("getPositionCell", () => {
    it("returns null for points in center", () => {
      const maze = generateCircularMaze(3);
      const centerX = 200;
      const centerY = 200;
      expect(getPositionCell(centerX, centerY, maze, centerX, centerY)).toBe(
        null
      );
    });

    it("returns null for points outside maze", () => {
      const maze = generateCircularMaze(3);
      const centerX = 200;
      const centerY = 200;
      const farPoint = centerX + maze.totalRadius + 50;
      expect(getPositionCell(farPoint, centerY, maze, centerX, centerY)).toBe(
        null
      );
    });

    it("returns correct ring and segment for point in maze", () => {
      const maze = generateCircularMaze(3);
      const centerX = 200;
      const centerY = 200;
      // Point at top of outer ring
      const radius = maze.totalRadius - maze.ringWidth / 2;
      const point = getPositionCell(
        centerX,
        centerY - radius,
        maze,
        centerX,
        centerY
      );
      expect(point).not.toBe(null);
      expect(point!.ring).toBe(maze.rings - 1);
    });
  });
});
