/**
 * Haptic feedback utilities using the Web Vibration API
 */

export interface HapticsConfig {
  enabled: boolean;
  wallHitDuration: number;
  winPattern: number[];
}

export const defaultHapticsConfig: HapticsConfig = {
  enabled: true,
  wallHitDuration: 50,
  winPattern: [100, 50, 100, 50, 200],
};

/**
 * Check if vibration is supported
 */
export function isVibrationSupported(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

/**
 * Vibrate on wall collision
 */
export function vibrateOnCollision(config: HapticsConfig = defaultHapticsConfig): void {
  if (!config.enabled || !isVibrationSupported()) return;
  navigator.vibrate(config.wallHitDuration);
}

/**
 * Vibrate on win
 */
export function vibrateOnWin(config: HapticsConfig = defaultHapticsConfig): void {
  if (!config.enabled || !isVibrationSupported()) return;
  navigator.vibrate(config.winPattern);
}

/**
 * Stop any ongoing vibration
 */
export function stopVibration(): void {
  if (!isVibrationSupported()) return;
  navigator.vibrate(0);
}
