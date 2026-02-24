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
  const [tier, setTier] = useState<PerformanceTier>("high");
  const [dpr, setDpr] = useState(1);

  useEffect(() => {
    const initPerformance = async () => {
      try {
        const gpuTier = await getGPUTier();
        
        // Determine tier based on GPU capabilities and FPS
        let detectedTier: PerformanceTier = "high";
        
        if (gpuTier.fps && gpuTier.fps < 30) {
          detectedTier = "low";
        } else if (gpuTier.tier < 2 || (gpuTier.fps && gpuTier.fps < 60)) {
          detectedTier = "medium";
        } else {
          detectedTier = "high";
        }
        
        // Also consider device memory if available (Chrome only)
        if (navigator.deviceMemory && navigator.deviceMemory < 4) {
            detectedTier = "low";
        }

        setTier(detectedTier);
        
        // Set DPR cap based on tier
        // High tier can go up to 2 (Retina), Low tier capped at 1 or even lower if needed
        const maxDpr = detectedTier === "high" ? 2 : detectedTier === "medium" ? 1.5 : 1;
        setDpr(Math.min(window.devicePixelRatio, maxDpr));
        
      } catch (e) {
        console.warn("GPU detection failed, defaulting to medium settings", e);
        setTier("medium");
        setDpr(1);
      }
    };

    initPerformance();
  }, []);

  const config = {
    tier,
    dpr,
    particleCountMultiplier: tier === "high" ? 1 : tier === "medium" ? 0.5 : 0.25,
    enablePostProcessing: tier !== "low",
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
