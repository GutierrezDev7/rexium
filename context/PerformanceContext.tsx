"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getGPUTier } from "detect-gpu";

// Extend Navigator interface for deviceMemory
declare global {
  interface Navigator {
    deviceMemory?: number;
  }
}

type PerformanceTier = "low" | "medium" | "high";

interface PerformanceContextType {
  tier: PerformanceTier;
  dpr: number;
  particleCountMultiplier: number;
  enablePostProcessing: boolean;
}

const PerformanceContext = createContext<PerformanceContextType>({
  tier: "high",
  dpr: 1, // Default safe fallback
  particleCountMultiplier: 1,
  enablePostProcessing: true,
});

export function PerformanceProvider({ children }: { children: ReactNode }) {
  // Force "low" tier globally for maximum performance on all devices
  const [tier] = useState<PerformanceTier>("low");
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    // Set safe DPR, capping at 1.5 even for high-DPI screens to save GPU fill-rate
    setDpr(Math.min(window.devicePixelRatio, 1.5));
  }, []);

  const config = {
    tier,
    dpr,
    // Use conservative settings regardless of tier state
    particleCountMultiplier: 0.25, // Low particle count
    enablePostProcessing: false, // Disable expensive post-processing
  };

  return (
    <PerformanceContext.Provider value={config}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  return useContext(PerformanceContext);
}
