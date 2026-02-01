/**
 * Hook for keyboard input (arrow keys or WASD)
 * Provides normalized direction values for desktop fallback
 */

import { useState, useEffect, useCallback, useRef } from "react";

export interface KeyboardState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export interface UseKeyboardResult {
  keys: KeyboardState;
  getTilt: () => { x: number; y: number };
}

export function useKeyboard(): UseKeyboardResult {
  const keysRef = useRef<KeyboardState>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const [keys, setKeys] = useState<KeyboardState>(keysRef.current);

  const updateKey = useCallback(
    (key: keyof KeyboardState, pressed: boolean) => {
      if (keysRef.current[key] !== pressed) {
        keysRef.current = { ...keysRef.current, [key]: pressed };
        setKeys(keysRef.current);
      }
    },
    []
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          event.preventDefault();
          updateKey("up", true);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          event.preventDefault();
          updateKey("down", true);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          event.preventDefault();
          updateKey("left", true);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          event.preventDefault();
          updateKey("right", true);
          break;
      }
    },
    [updateKey]
  );

  const handleKeyUp = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowUp":
        case "w":
        case "W":
          updateKey("up", false);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          updateKey("down", false);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          updateKey("left", false);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          updateKey("right", false);
          break;
      }
    },
    [updateKey]
  );

  // Get normalized tilt values (-1 to 1) from keyboard state
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

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return { keys, getTilt };
}
