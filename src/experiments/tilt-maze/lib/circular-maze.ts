/**
 * Circular maze generation with concentric rings
 * Player starts on outer ring and navigates to center
 */

export interface CircularCell {
  innerWall: boolean;  // Wall toward center
  outerWall: boolean;  // Wall away from center
  cwWall: boolean;     // Clockwise wall
  ccwWall: boolean;    // Counter-clockwise wall
}

export interface CircularMaze {
  rings: number;
  segmentsPerRing: number[];
  cells: CircularCell[][];  // [ring][segment]
  centerRadius: number;
  ringWidth: number;
  totalRadius: number;
}

// Seeded random number generator
function createRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/**
 * Generate a circular maze with the specified number of rings
 */
export function generateCircularMaze(
  rings: number,
  seed?: number
): CircularMaze {
  const actualSeed = seed ?? Date.now();
  const random = createRandom(actualSeed);

  const centerRadius = 30;
  const ringWidth = 35;
  const totalRadius = centerRadius + rings * ringWidth;

  // Calculate segments per ring (more segments in outer rings)
  const baseSegments = 8;
  const segmentsPerRing: number[] = [];
  for (let r = 0; r < rings; r++) {
    // Inner rings have fewer segments, outer rings have more
    const ringRadius = centerRadius + (r + 0.5) * ringWidth;
    const circumference = 2 * Math.PI * ringRadius;
    const minSegmentArc = 25; // Minimum arc length per segment (smaller = more segments)
    const segments = Math.max(baseSegments, Math.floor(circumference / minSegmentArc));
    // Round to nice numbers that divide evenly
    segmentsPerRing.push(Math.round(segments / 2) * 2);
  }

  // Initialize cells with all walls
  const cells: CircularCell[][] = [];
  for (let r = 0; r < rings; r++) {
    cells[r] = [];
    for (let s = 0; s < segmentsPerRing[r]; s++) {
      cells[r][s] = {
        innerWall: true,
        outerWall: r === rings - 1, // Only outermost ring has outer wall
        cwWall: true,
        ccwWall: true,
      };
    }
  }

  // Use modified Prim's algorithm for maze generation
  // Track visited cells
  const visited: boolean[][] = [];
  for (let r = 0; r < rings; r++) {
    visited[r] = new Array(segmentsPerRing[r]).fill(false);
  }

  // Start from outer ring (random segment)
  const startRing = rings - 1;
  const startSegment = Math.floor(random() * segmentsPerRing[startRing]);

  // Frontier cells
  interface FrontierCell {
    ring: number;
    segment: number;
    fromRing: number;
    fromSegment: number;
    direction: "inner" | "outer" | "cw" | "ccw";
  }

  const frontier: FrontierCell[] = [];
  visited[startRing][startSegment] = true;

  // Add neighbors to frontier
  const addNeighbors = (ring: number, segment: number) => {
    const segCount = segmentsPerRing[ring];

    // Clockwise neighbor (same ring)
    const cwSeg = (segment + 1) % segCount;
    if (!visited[ring][cwSeg]) {
      frontier.push({
        ring,
        segment: cwSeg,
        fromRing: ring,
        fromSegment: segment,
        direction: "ccw",
      });
    }

    // Counter-clockwise neighbor (same ring)
    const ccwSeg = (segment - 1 + segCount) % segCount;
    if (!visited[ring][ccwSeg]) {
      frontier.push({
        ring,
        segment: ccwSeg,
        fromRing: ring,
        fromSegment: segment,
        direction: "cw",
      });
    }

    // Inner neighbor (toward center)
    if (ring > 0) {
      const innerSegCount = segmentsPerRing[ring - 1];
      // Map current segment to inner ring segment
      const innerSeg = Math.floor((segment / segCount) * innerSegCount);
      if (!visited[ring - 1][innerSeg]) {
        frontier.push({
          ring: ring - 1,
          segment: innerSeg,
          fromRing: ring,
          fromSegment: segment,
          direction: "outer",
        });
      }
    }

    // Outer neighbor (away from center)
    if (ring < rings - 1) {
      const outerSegCount = segmentsPerRing[ring + 1];
      // Map current segment to outer ring segment(s)
      const ratio = outerSegCount / segCount;
      const outerSegStart = Math.floor(segment * ratio);
      const outerSegEnd = Math.floor((segment + 1) * ratio);
      for (let os = outerSegStart; os < outerSegEnd; os++) {
        if (!visited[ring + 1][os]) {
          frontier.push({
            ring: ring + 1,
            segment: os,
            fromRing: ring,
            fromSegment: segment,
            direction: "inner",
          });
        }
      }
    }
  };

  addNeighbors(startRing, startSegment);

  // Prim's algorithm
  while (frontier.length > 0) {
    const idx = Math.floor(random() * frontier.length);
    const cell = frontier[idx];
    frontier.splice(idx, 1);

    if (visited[cell.ring][cell.segment]) continue;

    visited[cell.ring][cell.segment] = true;

    // Carve passage
    if (cell.direction === "cw") {
      cells[cell.ring][cell.segment].cwWall = false;
      cells[cell.fromRing][cell.fromSegment].ccwWall = false;
    } else if (cell.direction === "ccw") {
      cells[cell.ring][cell.segment].ccwWall = false;
      cells[cell.fromRing][cell.fromSegment].cwWall = false;
    } else if (cell.direction === "inner") {
      cells[cell.ring][cell.segment].innerWall = false;
      // Find which segment in the inner ring this connects to
      const innerSegCount = segmentsPerRing[cell.ring - 1];
      const segCount = segmentsPerRing[cell.ring];
      const innerSeg = Math.floor((cell.segment / segCount) * innerSegCount);
      if (cell.fromRing === cell.ring - 1 && cell.fromSegment === innerSeg) {
        cells[cell.fromRing][cell.fromSegment].outerWall = false;
      }
    } else if (cell.direction === "outer") {
      cells[cell.ring][cell.segment].outerWall = false;
      cells[cell.fromRing][cell.fromSegment].innerWall = false;
    }

    addNeighbors(cell.ring, cell.segment);
  }

  // Ensure path to center: open inner wall of at least one innermost ring cell
  const innerRingCells = segmentsPerRing[0];
  const openCell = Math.floor(random() * innerRingCells);
  cells[0][openCell].innerWall = false;

  return {
    rings,
    segmentsPerRing,
    cells,
    centerRadius,
    ringWidth,
    totalRadius,
  };
}

/**
 * Get the angular bounds of a segment
 */
export function getSegmentAngles(
  maze: CircularMaze,
  ring: number,
  segment: number
): { startAngle: number; endAngle: number } {
  const segCount = maze.segmentsPerRing[ring];
  const segmentAngle = (2 * Math.PI) / segCount;
  const startAngle = segment * segmentAngle - Math.PI / 2; // Start from top
  const endAngle = startAngle + segmentAngle;
  return { startAngle, endAngle };
}

/**
 * Get the radial bounds of a ring
 */
export function getRingRadii(
  maze: CircularMaze,
  ring: number
): { innerRadius: number; outerRadius: number } {
  const innerRadius = maze.centerRadius + ring * maze.ringWidth;
  const outerRadius = innerRadius + maze.ringWidth;
  return { innerRadius, outerRadius };
}

/**
 * Check if point is in the goal (center)
 */
export function isInCenter(
  x: number,
  y: number,
  maze: CircularMaze,
  centerX: number,
  centerY: number
): boolean {
  const dx = x - centerX;
  const dy = y - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist < maze.centerRadius * 0.8;
}

/**
 * Get which ring and segment a point is in
 */
export function getPositionCell(
  x: number,
  y: number,
  maze: CircularMaze,
  centerX: number,
  centerY: number
): { ring: number; segment: number } | null {
  const dx = x - centerX;
  const dy = y - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Check if in center
  if (dist < maze.centerRadius) {
    return null; // In goal area
  }

  // Check if outside maze
  if (dist > maze.totalRadius) {
    return null;
  }

  // Find ring
  const ringFloat = (dist - maze.centerRadius) / maze.ringWidth;
  const ring = Math.floor(ringFloat);
  if (ring < 0 || ring >= maze.rings) {
    return null;
  }

  // Find segment
  let angle = Math.atan2(dy, dx) + Math.PI / 2; // Offset so 0 is at top
  if (angle < 0) angle += 2 * Math.PI;
  const segCount = maze.segmentsPerRing[ring];
  const segment = Math.floor((angle / (2 * Math.PI)) * segCount) % segCount;

  return { ring, segment };
}

/**
 * Check if the maze is solvable (path from outer ring to center)
 */
export function isCircularMazeSolvable(maze: CircularMaze): boolean {
  const visited: boolean[][] = [];
  for (let r = 0; r < maze.rings; r++) {
    visited[r] = new Array(maze.segmentsPerRing[r]).fill(false);
  }

  // BFS from all outer ring cells
  const queue: { ring: number; segment: number }[] = [];
  for (let s = 0; s < maze.segmentsPerRing[maze.rings - 1]; s++) {
    queue.push({ ring: maze.rings - 1, segment: s });
    visited[maze.rings - 1][s] = true;
  }

  while (queue.length > 0) {
    const { ring, segment } = queue.shift()!;
    const cell = maze.cells[ring][segment];
    const segCount = maze.segmentsPerRing[ring];

    // Check if we can reach center
    if (ring === 0 && !cell.innerWall) {
      return true;
    }

    // Check clockwise
    if (!cell.cwWall) {
      const cwSeg = (segment + 1) % segCount;
      if (!visited[ring][cwSeg]) {
        visited[ring][cwSeg] = true;
        queue.push({ ring, segment: cwSeg });
      }
    }

    // Check counter-clockwise
    if (!cell.ccwWall) {
      const ccwSeg = (segment - 1 + segCount) % segCount;
      if (!visited[ring][ccwSeg]) {
        visited[ring][ccwSeg] = true;
        queue.push({ ring, segment: ccwSeg });
      }
    }

    // Check inner
    if (!cell.innerWall && ring > 0) {
      const innerSegCount = maze.segmentsPerRing[ring - 1];
      const innerSeg = Math.floor((segment / segCount) * innerSegCount);
      if (!visited[ring - 1][innerSeg]) {
        visited[ring - 1][innerSeg] = true;
        queue.push({ ring: ring - 1, segment: innerSeg });
      }
    }

    // Check outer
    if (!cell.outerWall && ring < maze.rings - 1) {
      const outerSegCount = maze.segmentsPerRing[ring + 1];
      const ratio = outerSegCount / segCount;
      const outerSegStart = Math.floor(segment * ratio);
      const outerSegEnd = Math.floor((segment + 1) * ratio);
      for (let os = outerSegStart; os < outerSegEnd; os++) {
        if (!visited[ring + 1][os]) {
          visited[ring + 1][os] = true;
          queue.push({ ring: ring + 1, segment: os });
        }
      }
    }
  }

  return false;
}
