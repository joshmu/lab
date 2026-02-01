/**
 * Hook for keyboard input (arrow keys or WASD)
 * Provides normalized direction values for desktop fallback
 */

import { useEffect, useCallback, useRef } from "react";

interface KeyboardState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

type Direction = keyof KeyboardState;

/** Key to direction mapping */
const KEY_MAP: Record<string, Direction> = {
  ArrowUp: "up",
  w: "up",
  W: "up",
  ArrowDown: "down",
  s: "down",
  S: "down",
  ArrowLeft: "left",
  a: "left",
  A: "left",
  ArrowRight: "right",
  d: "right",
  D: "right",
};

export interface UseKeyboardResult {
  getTilt: () => { x: number; y: number };
}

export function useKeyboard(): UseKeyboardResult {
  const keysRef = useRef<KeyboardState>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const direction = KEY_MAP[event.key];
      if (direction) {
        event.preventDefault();
        keysRef.current[direction] = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const direction = KEY_MAP[event.key];
      if (direction) {
        keysRef.current[direction] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const getTilt = useCallback(() => {
    const { up, down, left, right } = keysRef.current;

    let x = 0;
    let y = 0;

    if (left) x -= 1;
    if (right) x += 1;
    if (up) y -= 1;
    if (down) y += 1;

    // Normalize diagonal movement
    if (x !== 0 && y !== 0) {
      const magnitude = Math.sqrt(x * x + y * y);
      x /= magnitude;
      y /= magnitude;
    }

    return { x, y };
  }, []);

  return { getTilt };
}
