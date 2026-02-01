/**
 * Ball physics engine with velocity, friction, and acceleration
 */

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export interface PhysicsConfig {
  friction: number; // 0-1, higher = less friction (0.98 typical)
  maxSpeed: number; // Maximum velocity magnitude
  acceleration: number; // Force multiplier
  bounceElasticity: number; // 0-1, energy retained on bounce
}

export const defaultPhysicsConfig: PhysicsConfig = {
  friction: 0.98,
  maxSpeed: 4, // Reduced to prevent tunneling through walls
  acceleration: 0.35, // Reduced for better control
  bounceElasticity: 0.25,
};

/** Minimum velocity threshold below which ball stops */
const MIN_VELOCITY_THRESHOLD = 0.01;

/**
 * Create a new ball at the specified position
 */
export function createBall(x: number, y: number, radius: number): Ball {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    radius,
  };
}

/**
 * Apply a force to the ball (from tilt or input)
 * Forces are normalized (-1 to 1 range expected)
 */
export function applyForce(
  ball: Ball,
  forceX: number,
  forceY: number,
  config: PhysicsConfig
): Ball {
  let vx = ball.vx + forceX * config.acceleration;
  let vy = ball.vy + forceY * config.acceleration;

  // Clamp to max speed
  const speed = Math.sqrt(vx * vx + vy * vy);
  if (speed > config.maxSpeed) {
    const scale = config.maxSpeed / speed;
    vx *= scale;
    vy *= scale;
  }

  return {
    ...ball,
    vx,
    vy,
  };
}

/**
 * Update ball position and apply friction
 * deltaTime is in normalized units (1 = one frame at 60fps)
 */
export function updateBall(
  ball: Ball,
  deltaTime: number,
  config: PhysicsConfig
): Ball {
  // Update position first using current velocity
  const x = ball.x + ball.vx * deltaTime;
  const y = ball.y + ball.vy * deltaTime;

  // Then apply friction
  const frictionFactor = Math.pow(config.friction, deltaTime);
  let vx = ball.vx * frictionFactor;
  let vy = ball.vy * frictionFactor;

  // Stop very slow movement
  if (Math.abs(vx) < MIN_VELOCITY_THRESHOLD && Math.abs(vy) < MIN_VELOCITY_THRESHOLD) {
    vx = 0;
    vy = 0;
  }

  return {
    ...ball,
    x,
    y,
    vx,
    vy,
  };
}
