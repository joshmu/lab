import { describe, it, expect } from "vitest";
import {
  createBall,
  updateBall,
  applyForce,
  type PhysicsConfig,
} from "./physics";

describe("Ball Physics", () => {
  const defaultConfig: PhysicsConfig = {
    friction: 0.98,
    maxSpeed: 10,
    acceleration: 0.5,
    bounceElasticity: 0.3,
  };

  describe("createBall", () => {
    it("creates a ball at the specified position", () => {
      const ball = createBall(100, 100, 10);
      expect(ball.x).toBe(100);
      expect(ball.y).toBe(100);
      expect(ball.radius).toBe(10);
    });

    it("initializes velocity to zero", () => {
      const ball = createBall(100, 100, 10);
      expect(ball.vx).toBe(0);
      expect(ball.vy).toBe(0);
    });
  });

  describe("applyForce", () => {
    it("applies force to velocity", () => {
      let ball = createBall(100, 100, 10);
      ball = applyForce(ball, 1, 0, defaultConfig);
      expect(ball.vx).toBeGreaterThan(0);
      expect(ball.vy).toBe(0);
    });

    it("applies force in both directions", () => {
      let ball = createBall(100, 100, 10);
      ball = applyForce(ball, 1, 1, defaultConfig);
      expect(ball.vx).toBeGreaterThan(0);
      expect(ball.vy).toBeGreaterThan(0);
    });

    it("respects max speed limit", () => {
      let ball = createBall(100, 100, 10);
      // Apply large force multiple times
      for (let i = 0; i < 100; i++) {
        ball = applyForce(ball, 10, 0, defaultConfig);
      }
      const speed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
      expect(speed).toBeLessThanOrEqual(defaultConfig.maxSpeed);
    });

    it("uses acceleration config value", () => {
      const ball1 = applyForce(createBall(0, 0, 10), 1, 0, {
        ...defaultConfig,
        acceleration: 0.5,
      });
      const ball2 = applyForce(createBall(0, 0, 10), 1, 0, {
        ...defaultConfig,
        acceleration: 1.0,
      });
      expect(ball2.vx).toBe(ball1.vx * 2);
    });
  });

  describe("updateBall", () => {
    it("updates position based on velocity", () => {
      let ball = createBall(100, 100, 10);
      ball.vx = 5;
      ball.vy = 3;
      ball = updateBall(ball, 1, defaultConfig);
      expect(ball.x).toBeCloseTo(105, 1);
      expect(ball.y).toBeCloseTo(103, 1);
    });

    it("applies friction to slow the ball", () => {
      let ball = createBall(100, 100, 10);
      ball.vx = 10;
      ball.vy = 10;
      const initialSpeed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
      ball = updateBall(ball, 1, defaultConfig);
      const newSpeed = Math.sqrt(ball.vx ** 2 + ball.vy ** 2);
      expect(newSpeed).toBeLessThan(initialSpeed);
    });

    it("uses delta time for frame-rate independence", () => {
      let ball1 = createBall(100, 100, 10);
      ball1.vx = 10;
      ball1 = updateBall(ball1, 1, defaultConfig);

      let ball2 = createBall(100, 100, 10);
      ball2.vx = 10;
      ball2 = updateBall(ball2, 0.5, defaultConfig);
      ball2 = updateBall(ball2, 0.5, defaultConfig);

      // Two half-steps should approximately equal one full step
      expect(ball1.x).toBeCloseTo(ball2.x, 0);
    });

    it("stops ball when velocity is very small", () => {
      let ball = createBall(100, 100, 10);
      ball.vx = 0.001;
      ball.vy = 0.001;
      ball = updateBall(ball, 1, defaultConfig);
      // Very small velocities should be zeroed out
      expect(ball.vx).toBe(0);
      expect(ball.vy).toBe(0);
    });
  });

  describe("physics simulation consistency", () => {
    it("ball eventually stops due to friction", () => {
      let ball = createBall(100, 100, 10);
      ball.vx = 10;
      ball.vy = 10;

      // Use much stronger friction for faster convergence in test
      const testConfig = { ...defaultConfig, friction: 0.5 };

      // Simulate frames until ball stops or max iterations
      for (let i = 0; i < 1000; i++) {
        ball = updateBall(ball, 1, testConfig);
        if (ball.vx === 0 && ball.vy === 0) break;
      }

      // Ball should have stopped
      expect(Math.abs(ball.vx)).toBeLessThan(0.1);
      expect(Math.abs(ball.vy)).toBeLessThan(0.1);
    });
  });
});
