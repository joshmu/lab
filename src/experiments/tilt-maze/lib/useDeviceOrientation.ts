/**
 * Hook for device orientation (accelerometer) input
 * Handles iOS permission flow and provides normalized tilt values
 */

import { useState, useEffect, useCallback, useRef } from "react";

export interface OrientationState {
  beta: number; // Front-to-back tilt (-180 to 180)
  gamma: number; // Left-to-right tilt (-90 to 90)
  supported: boolean;
  permissionState: "prompt" | "granted" | "denied" | "unavailable";
}

export interface UseDeviceOrientationResult {
  orientation: OrientationState;
  requestPermission: () => Promise<boolean>;
  calibrate: () => void;
  getTilt: () => { x: number; y: number };
}

// Check if DeviceOrientationEvent is available and needs permission
function needsPermission(): boolean {
  return (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === "function"
  );
}

function isSupported(): boolean {
  return typeof window !== "undefined" && "DeviceOrientationEvent" in window;
}

export function useDeviceOrientation(): UseDeviceOrientationResult {
  const [orientation, setOrientation] = useState<OrientationState>({
    beta: 0,
    gamma: 0,
    supported: false,
    permissionState: "prompt",
  });

  // Calibration offset (the "level" position)
  const calibrationRef = useRef({ beta: 0, gamma: 0 });
  const lastOrientationRef = useRef({ beta: 0, gamma: 0 });

  // Handle orientation events
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const beta = event.beta ?? 0;
    const gamma = event.gamma ?? 0;

    lastOrientationRef.current = { beta, gamma };

    setOrientation((prev) => ({
      ...prev,
      beta,
      gamma,
    }));
  }, []);

  // Request permission (required for iOS 13+)
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported()) {
      setOrientation((prev) => ({
        ...prev,
        permissionState: "unavailable",
      }));
      return false;
    }

    if (needsPermission()) {
      try {
        const DOE = DeviceOrientationEvent as unknown as {
          requestPermission: () => Promise<"granted" | "denied">;
        };
        const permission = await DOE.requestPermission();

        if (permission === "granted") {
          setOrientation((prev) => ({
            ...prev,
            supported: true,
            permissionState: "granted",
          }));
          window.addEventListener("deviceorientation", handleOrientation);
          return true;
        } else {
          setOrientation((prev) => ({
            ...prev,
            permissionState: "denied",
          }));
          return false;
        }
      } catch {
        setOrientation((prev) => ({
          ...prev,
          permissionState: "denied",
        }));
        return false;
      }
    } else {
      // Android or older browsers - just add the listener
      window.addEventListener("deviceorientation", handleOrientation);
      setOrientation((prev) => ({
        ...prev,
        supported: true,
        permissionState: "granted",
      }));
      return true;
    }
  }, [handleOrientation]);

  // Calibrate: set current position as "level"
  const calibrate = useCallback(() => {
    calibrationRef.current = {
      beta: lastOrientationRef.current.beta,
      gamma: lastOrientationRef.current.gamma,
    };
  }, []);

  // Get normalized tilt values (-1 to 1) relative to calibration
  const getTilt = useCallback(() => {
    const { beta, gamma } = lastOrientationRef.current;
    const cal = calibrationRef.current;

    // Subtract calibration offset
    const adjustedBeta = beta - cal.beta;
    const adjustedGamma = gamma - cal.gamma;

    // Normalize to -1 to 1 range
    // Beta: -180 to 180, but we care about -45 to 45 for gameplay
    // Gamma: -90 to 90, but we care about -45 to 45 for gameplay
    const maxTilt = 45; // degrees - higher value = less sensitive

    const x = Math.max(-1, Math.min(1, adjustedGamma / maxTilt));
    const y = Math.max(-1, Math.min(1, adjustedBeta / maxTilt));

    return { x, y };
  }, []);

  // Check initial support
  useEffect(() => {
    setOrientation((prev) => ({
      ...prev,
      supported: isSupported(),
      permissionState: isSupported()
        ? (needsPermission() ? "prompt" : "granted")
        : "unavailable",
    }));

    // On Android, we can add listener immediately
    if (isSupported() && !needsPermission()) {
      window.addEventListener("deviceorientation", handleOrientation);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [handleOrientation]);

  return {
    orientation,
    requestPermission,
    calibrate,
    getTilt,
  };
}
