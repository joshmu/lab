/**
 * Hook for managing the game loop with requestAnimationFrame
 * Provides consistent timing regardless of refresh rate
 */

import { useEffect, useRef, useCallback } from "react";

export interface GameLoopOptions {
  targetFps?: number;
  onUpdate: (deltaTime: number) => void;
  onRender: () => void;
  paused?: boolean;
}

export function useGameLoop({
  targetFps = 60,
  onUpdate,
  onRender,
  paused = false,
}: GameLoopOptions): void {
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);

  // Fixed time step for physics (in ms)
  const fixedDeltaTime = 1000 / targetFps;

  const gameLoop = useCallback(
    (currentTime: number) => {
      if (paused) {
        lastTimeRef.current = currentTime;
        frameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Calculate delta time
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Cap delta time to prevent spiral of death
      const cappedDelta = Math.min(deltaTime, 100);
      accumulatorRef.current += cappedDelta;

      // Fixed timestep updates for deterministic physics
      while (accumulatorRef.current >= fixedDeltaTime) {
        onUpdate(1); // Normalized delta time (1 = one physics step)
        accumulatorRef.current -= fixedDeltaTime;
      }

      // Render at display refresh rate
      onRender();

      frameRef.current = requestAnimationFrame(gameLoop);
    },
    [fixedDeltaTime, onUpdate, onRender, paused]
  );

  useEffect(() => {
    frameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [gameLoop]);
}
