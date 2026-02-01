/**
 * Maze generation using a hybrid Growing Tree algorithm
 * Combines recursive backtracking (long corridors) with Prim's (decision points)
 */

export interface Cell {
  north: boolean;
  south: boolean;
  east: boolean;
  west: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface Maze {
  width: number;
  height: number;
  cells: Cell[][];
  start: Position;
  end: Position;
}

// Seeded random number generator for deterministic maze generation
function createRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

type Direction = "north" | "south" | "east" | "west";

const opposites: Record<Direction, Direction> = {
  north: "south",
  south: "north",
  east: "west",
  west: "east",
};

const deltas: Record<Direction, { dx: number; dy: number }> = {
  north: { dx: 0, dy: -1 },
  south: { dx: 0, dy: 1 },
  east: { dx: 1, dy: 0 },
  west: { dx: -1, dy: 0 },
};

function createEmptyCell(): Cell {
  return { north: true, south: true, east: true, west: true };
}

function shuffleArray<T>(arr: T[], random: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates a maze using Growing Tree algorithm
 * Mix ratio controls backtracking vs Prim's behavior:
 * - Higher values = more long corridors (backtracking)
 * - Lower values = more branching (Prim's)
 */
export function generateMaze(
  width: number,
  height: number,
  seed?: number
): Maze {
  const actualSeed = seed ?? Date.now();
  const random = createRandom(actualSeed);

  // Initialize cells with all walls
  const cells: Cell[][] = [];
  for (let y = 0; y < height; y++) {
    cells[y] = [];
    for (let x = 0; x < width; x++) {
      cells[y][x] = createEmptyCell();
    }
  }

  // Track visited cells
  const visited: boolean[][] = [];
  for (let y = 0; y < height; y++) {
    visited[y] = new Array(width).fill(false);
  }

  // Growing Tree algorithm
  const active: Position[] = [];

  // Start from top-left
  const startX = 0;
  const startY = 0;
  active.push({ x: startX, y: startY });
  visited[startY][startX] = true;

  const directions: Direction[] = ["north", "south", "east", "west"];
  const backtrackRatio = 0.7; // 70% backtracking, 30% Prim's

  while (active.length > 0) {
    // Choose cell: mostly newest (backtracking) but sometimes random (Prim's)
    const index =
      random() < backtrackRatio
        ? active.length - 1
        : Math.floor(random() * active.length);

    const current = active[index];
    const shuffledDirs = shuffleArray(directions, random);

    let carved = false;
    for (const dir of shuffledDirs) {
      const { dx, dy } = deltas[dir];
      const nx = current.x + dx;
      const ny = current.y + dy;

      if (nx >= 0 && nx < width && ny >= 0 && ny < height && !visited[ny][nx]) {
        // Carve passage
        cells[current.y][current.x][dir] = false;
        cells[ny][nx][opposites[dir]] = false;

        visited[ny][nx] = true;
        active.push({ x: nx, y: ny });
        carved = true;
        break;
      }
    }

    if (!carved) {
      active.splice(index, 1);
    }
  }

  return {
    width,
    height,
    cells,
    start: { x: 0, y: 0 },
    end: { x: width - 1, y: height - 1 },
  };
}

/**
 * Get a cell at the specified coordinates
 */
export function getCell(maze: Maze, x: number, y: number): Cell {
  if (x < 0 || x >= maze.width || y < 0 || y >= maze.height) {
    throw new Error(`Cell coordinates out of bounds: (${x}, ${y})`);
  }
  return maze.cells[y][x];
}

/**
 * Check if the maze is solvable using BFS
 */
export function isSolvable(maze: Maze): boolean {
  const { width, height, start, end } = maze;

  const visited: boolean[][] = [];
  for (let y = 0; y < height; y++) {
    visited[y] = new Array(width).fill(false);
  }

  const queue: Position[] = [{ x: start.x, y: start.y }];
  visited[start.y][start.x] = true;

  const directions: Direction[] = ["north", "south", "east", "west"];

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.x === end.x && current.y === end.y) {
      return true;
    }

    for (const dir of directions) {
      const cell = maze.cells[current.y][current.x];
      if (cell[dir]) continue; // Wall blocks this direction

      const { dx, dy } = deltas[dir];
      const nx = current.x + dx;
      const ny = current.y + dy;

      if (
        nx >= 0 &&
        nx < width &&
        ny >= 0 &&
        ny < height &&
        !visited[ny][nx]
      ) {
        visited[ny][nx] = true;
        queue.push({ x: nx, y: ny });
      }
    }
  }

  return false;
}
