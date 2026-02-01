import { describe, it, expect } from "vitest";
import { generateMaze, isSolvable, getCell } from "./maze";

describe("Maze Generation", () => {
  describe("generateMaze", () => {
    it("creates a maze with the specified dimensions", () => {
      const maze = generateMaze(5, 5);
      expect(maze.width).toBe(5);
      expect(maze.height).toBe(5);
      expect(maze.cells.length).toBe(5);
      expect(maze.cells[0].length).toBe(5);
    });

    it("generates different mazes with different seeds", () => {
      const maze1 = generateMaze(5, 5, 12345);
      const maze2 = generateMaze(5, 5, 67890);
      // Mazes should have different wall configurations
      const walls1 = JSON.stringify(maze1.cells);
      const walls2 = JSON.stringify(maze2.cells);
      expect(walls1).not.toBe(walls2);
    });

    it("generates identical mazes with the same seed", () => {
      const maze1 = generateMaze(5, 5, 42);
      const maze2 = generateMaze(5, 5, 42);
      expect(JSON.stringify(maze1.cells)).toBe(JSON.stringify(maze2.cells));
    });

    it("creates a start position at top-left", () => {
      const maze = generateMaze(5, 5);
      expect(maze.start).toEqual({ x: 0, y: 0 });
    });

    it("creates an end position at bottom-right", () => {
      const maze = generateMaze(5, 5);
      expect(maze.end).toEqual({ x: 4, y: 4 });
    });

    it("each cell has wall properties", () => {
      const maze = generateMaze(3, 3);
      const cell = getCell(maze, 1, 1);
      expect(cell).toHaveProperty("north");
      expect(cell).toHaveProperty("south");
      expect(cell).toHaveProperty("east");
      expect(cell).toHaveProperty("west");
      expect(typeof cell.north).toBe("boolean");
      expect(typeof cell.south).toBe("boolean");
      expect(typeof cell.east).toBe("boolean");
      expect(typeof cell.west).toBe("boolean");
    });

    it("has outer walls on boundary cells", () => {
      const maze = generateMaze(5, 5);
      // Top row should have north walls
      for (let x = 0; x < 5; x++) {
        expect(getCell(maze, x, 0).north).toBe(true);
      }
      // Bottom row should have south walls
      for (let x = 0; x < 5; x++) {
        expect(getCell(maze, x, 4).south).toBe(true);
      }
      // Left column should have west walls
      for (let y = 0; y < 5; y++) {
        expect(getCell(maze, 0, y).west).toBe(true);
      }
      // Right column should have east walls
      for (let y = 0; y < 5; y++) {
        expect(getCell(maze, 4, y).east).toBe(true);
      }
    });

    it("handles various maze sizes", () => {
      const sizes = [
        [3, 3],
        [5, 5],
        [7, 7],
        [10, 10],
        [15, 15],
      ];
      for (const [w, h] of sizes) {
        const maze = generateMaze(w, h);
        expect(maze.width).toBe(w);
        expect(maze.height).toBe(h);
        expect(isSolvable(maze)).toBe(true);
      }
    });
  });

  describe("isSolvable", () => {
    it("returns true for a valid generated maze", () => {
      const maze = generateMaze(5, 5);
      expect(isSolvable(maze)).toBe(true);
    });

    it("returns true for mazes of various sizes", () => {
      for (let size = 3; size <= 10; size++) {
        const maze = generateMaze(size, size);
        expect(isSolvable(maze)).toBe(true);
      }
    });
  });

  describe("getCell", () => {
    it("returns the correct cell", () => {
      const maze = generateMaze(5, 5);
      const cell = getCell(maze, 2, 3);
      expect(cell).toBe(maze.cells[3][2]);
    });

    it("throws for out of bounds coordinates", () => {
      const maze = generateMaze(5, 5);
      expect(() => getCell(maze, -1, 0)).toThrow();
      expect(() => getCell(maze, 5, 0)).toThrow();
      expect(() => getCell(maze, 0, -1)).toThrow();
      expect(() => getCell(maze, 0, 5)).toThrow();
    });
  });
});
