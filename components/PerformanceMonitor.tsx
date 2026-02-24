"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePerformance } from "@/context/PerformanceContext";

export default function PerformanceMonitor() {
  const { tier, dpr, particleCountMultiplier } = usePerformance();
  const [fps, setFps] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    // Only show if query param ?debug=true is present
    const urlParams = new URLSearchParams(window.location.search);
    const isDebug = urlParams.get("debug") === "true";
    
    if (isDebug) {
      setIsVisible(true);
    } else {
      return; // Don't start loop if not visible
    }

    const loop = (time: number) => {
      frameCount.current++;
      if (time - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = time;
      }
      requestAnimationFrame(loop);
    };
    
    const rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 left-4 z-[9999] bg-black/80 backdrop-blur-md border border-white/10 p-4 rounded text-[10px] font-mono text-white pointer-events-none select-none">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">FPS:</span>
          <span className={`${fps < 30 ? "text-red-500" : fps < 55 ? "text-yellow-500" : "text-green-500"}`}>{fps}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">TIER:</span>
          <span className="text-cyan-400 uppercase">{tier}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">DPR:</span>
          <span>{dpr.toFixed(1)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-400">PARTICLES:</span>
          <span>{(particleCountMultiplier * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}