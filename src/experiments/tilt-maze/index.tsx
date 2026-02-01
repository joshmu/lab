"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  RotateCcw,
  ChevronRight,
  Smartphone,
  Keyboard,
  Volume2,
  VolumeX,
} from "lucide-react";

import {
  createInitialState,
  startLevel,
  completeLevel,
  resetLevel,
  nextLevel,
  getLevelConfig,
  formatTime,
  type GameState,
} from "./lib/gameState";
import {
  updateBall,
  applyForce,
  defaultPhysicsConfig,
} from "./lib/physics";
import {
  checkCircularWallCollision,
  resolveCircularCollision,
  isAtCircularGoal,
} from "./lib/circular-collision";
import {
  renderCircularMaze,
  renderCircularBall,
  defaultCircularRenderConfig,
} from "./lib/circular-renderer";
import { useGameLoop } from "./lib/useGameLoop";
import { useDeviceOrientation } from "./lib/useDeviceOrientation";
import { useKeyboard } from "./lib/useKeyboard";
import {
  vibrateOnCollision,
  vibrateOnWin,
  isVibrationSupported,
} from "./lib/haptics";

export default function TiltMazeExperiment() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>(createInitialState);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [useAccelerometer, setUseAccelerometer] = useState(false);

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const { orientation, requestPermission, calibrate, getTilt: getAccelTilt } =
    useDeviceOrientation();
  const { getTilt: getKeyboardTilt } = useKeyboard();

  // Get current level config
  const levelConfig = getLevelConfig(gameState.level);
  const canvasSize = levelConfig.canvasSize;

  // Set up canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvasSize;
    canvas.height = canvasSize;
  }, [canvasSize]);

  // Game update function
  const handleUpdate = useCallback(
    (deltaTime: number) => {
      if (gameStateRef.current.status !== "playing") return;

      const state = gameStateRef.current;
      const tilt = useAccelerometer ? getAccelTilt() : getKeyboardTilt();

      // Store previous ball position for tunneling detection
      const prevBall = { ...state.ball };
      let ball = state.ball;

      // Apply tilt force
      ball = applyForce(ball, tilt.x, tilt.y, defaultPhysicsConfig);

      // Update physics
      ball = updateBall(ball, deltaTime, defaultPhysicsConfig);

      // Check collisions with multiple iterations to prevent tunneling
      const maxIterations = 3;
      for (let i = 0; i < maxIterations; i++) {
        const collision = checkCircularWallCollision(
          ball,
          state.maze,
          state.centerX,
          state.centerY
        );

        if (collision.collided) {
          ball = resolveCircularCollision(
            ball,
            collision,
            defaultPhysicsConfig.bounceElasticity
          );
          if (hapticsEnabled && i === 0) {
            vibrateOnCollision();
          }
        } else {
          break;
        }
      }

      // Check win condition
      if (isAtCircularGoal(ball, state.maze, state.centerX, state.centerY)) {
        if (hapticsEnabled) {
          vibrateOnWin();
        }
        setGameState((prev) => completeLevel({ ...prev, ball, prevBall }));
        return;
      }

      setGameState((prev) => ({ ...prev, ball, prevBall }));
    },
    [useAccelerometer, getAccelTilt, getKeyboardTilt, hapticsEnabled]
  );

  // Game render function
  const handleRender = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = gameStateRef.current;

    // Render maze
    renderCircularMaze(
      ctx,
      state.maze,
      state.centerX,
      state.centerY,
      defaultCircularRenderConfig
    );

    // Render ball
    renderCircularBall(ctx, state.ball, defaultCircularRenderConfig);
  }, []);

  // Start game loop
  useGameLoop({
    onUpdate: handleUpdate,
    onRender: handleRender,
    paused: gameState.status !== "playing",
  });

  // Handle start game
  const handleStart = async () => {
    if (
      orientation.permissionState === "prompt" &&
      orientation.supported
    ) {
      const granted = await requestPermission();
      if (granted) {
        setUseAccelerometer(true);
        calibrate();
      }
    } else if (orientation.permissionState === "granted") {
      setUseAccelerometer(true);
      calibrate();
    }
    setGameState((prev) => startLevel(prev, prev.level));
  };

  // Handle accelerometer toggle
  const handleToggleAccelerometer = async () => {
    if (!useAccelerometer && orientation.permissionState === "prompt") {
      const granted = await requestPermission();
      if (granted) {
        setUseAccelerometer(true);
        calibrate();
      }
    } else {
      setUseAccelerometer(!useAccelerometer);
      if (!useAccelerometer) {
        calibrate();
      }
    }
  };

  // Calculate elapsed time for display
  const displayTime =
    gameState.status === "playing"
      ? Date.now() - gameState.startTime
      : gameState.elapsedTime;

  return (
    <div className="flex flex-col items-center gap-6">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Circular Maze</CardTitle>
            <Badge variant="outline">Level {gameState.level}</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {/* Game Canvas */}
          <div
            className="relative border-2 border-neutral-200 dark:border-neutral-800 rounded-full overflow-hidden"
            style={{ width: canvasSize, height: canvasSize }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0"
              style={{ width: canvasSize, height: canvasSize }}
            />

            {/* Start overlay */}
            {gameState.status === "start" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-neutral-950/90 rounded-full">
                <h2 className="mb-4 text-xl font-bold">Circular Maze</h2>
                <p className="text-muted-foreground mb-4 text-center text-sm px-8">
                  Navigate from the outer ring to the{" "}
                  <span className="text-blue-500">blue center</span>
                </p>
                <Button onClick={handleStart} size="lg">
                  <Play className="mr-2 h-4 w-4" /> Start
                </Button>
              </div>
            )}

            {/* Win overlay */}
            {gameState.status === "won" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-neutral-950/90 rounded-full">
                <h2 className="mb-2 text-xl font-bold text-green-600">
                  Level Complete!
                </h2>
                <p className="text-muted-foreground mb-1 text-sm">
                  Time: {formatTime(gameState.elapsedTime)}
                </p>
                {gameState.bestTimes[gameState.level] && (
                  <p className="text-muted-foreground mb-4 text-xs">
                    Best: {formatTime(gameState.bestTimes[gameState.level])}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setGameState((prev) => resetLevel(prev))}
                  >
                    <RotateCcw className="mr-2 h-4 w-4" /> Retry
                  </Button>
                  <Button onClick={() => setGameState((prev) => nextLevel(prev))}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Timer */}
          {gameState.status === "playing" && (
            <div className="font-mono text-2xl tabular-nums">
              {formatTime(displayTime)}
            </div>
          )}

          {/* Controls */}
          <div className="flex w-full items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleAccelerometer}
                disabled={!orientation.supported}
                className={useAccelerometer ? "border-green-500" : ""}
              >
                <Smartphone className="mr-1 h-4 w-4" />
                Tilt
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseAccelerometer(false)}
                className={!useAccelerometer ? "border-green-500" : ""}
              >
                <Keyboard className="mr-1 h-4 w-4" />
                Keys
              </Button>
            </div>

            <div className="flex gap-2">
              {useAccelerometer && (
                <Button variant="outline" size="sm" onClick={calibrate}>
                  Calibrate
                </Button>
              )}
              {isVibrationSupported() && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setHapticsEnabled(!hapticsEnabled)}
                >
                  {hapticsEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Reset button */}
          {gameState.status === "playing" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGameState((prev) => resetLevel(prev))}
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Level
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <div className="text-muted-foreground max-w-md text-center text-sm">
        {useAccelerometer ? (
          <>
            Tilt your device to move the ball. Use the{" "}
            <strong>Calibrate</strong> button to set your current position as
            level.
          </>
        ) : (
          <>
            Use <strong>Arrow keys</strong> or <strong>WASD</strong> to move the
            ball through the maze to the center.
          </>
        )}
      </div>
    </div>
  );
}
