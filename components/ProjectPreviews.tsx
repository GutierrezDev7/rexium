"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Environment, PerspectiveCamera, Stars } from "@react-three/drei";
import { usePerformance } from "@/context/PerformanceContext";

// --- KRONOS (E-commerce / Product Focus) ---
function KronosScene() {
  const mesh = useRef<THREE.Mesh>(null);
  const { tier } = usePerformance();
  
  useFrame((state) => {
    if (mesh.current) {
        mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
        mesh.current.rotation.y += 0.005;
    }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={mesh}>
          {/* Abstract Torus Knot representing complex geometry/product */}
          <torusKnotGeometry args={[1, 0.3, 128, 32]} />
          <MeshTransmissionMaterial 
            backside
            backsideThickness={5}
            thickness={2}
            roughness={0.2}
            chromaticAberration={0.5}
            anisotropy={0.5}
            color="#ffffff"
            resolution={tier === 'high' ? 512 : 256}
            samples={tier === 'high' ? 10 : 6}
          />
        </mesh>
      </Float>
      
      <Environment preset="city" />
      
      {/* Cinematic Lighting */}
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} color="#4a9eff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#ff4a4a" />
    </group>
  );
}

export function KronosPreview() {
  return (
    <div className="w-full h-full bg-[#050505] relative overflow-hidden group flex items-center justify-center">
      {/* Cinematic Background - Abstract Product Light */}
      <div 
        className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-60 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s] ease-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60" />

      {/* Interactive Overlay UI */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
          <div className="w-32 h-32 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm group-hover:border-white/50 transition-colors duration-500">
              <div className="w-24 h-24 rounded-full bg-white/5 animate-pulse-slow"></div>
          </div>
          <p className="text-xs font-mono tracking-[0.3em] text-white/70 uppercase">360° Product View</p>
      </div>

      
      
    </div>
  );
}

// --- ORION (Data / Architecture Focus) ---
function OrionScene() {
    const pointsRef = useRef<THREE.Points>(null);
    const { particleCountMultiplier } = usePerformance();
    
    // Create a topographic data grid
    const particles = useMemo(() => {
        const count = Math.floor(2000 * particleCountMultiplier); // Efficient count
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        
        for(let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 10;
            const z = (Math.random() - 0.5) * 10;
            const y = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 1.5; // Wave terrain
            
            positions[i*3] = x;
            positions[i*3+1] = y;
            positions[i*3+2] = z;
            
            // Cyberpunk colors
            colors[i*3] = 0; // R
            colors[i*3+1] = 0.5 + Math.random() * 0.5; // G (Green/Cyan)
            colors[i*3+2] = 1; // B (Blue)
        }
        
        return { positions, colors };
    }, [particleCountMultiplier]);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.002;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[particles.positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[particles.colors, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
}

export function OrionPreview() {
    return (
        <div className="w-full h-full bg-[#050505] relative overflow-hidden group flex items-center justify-center">
            {/* Cinematic Background - Wireframe City/Grid */}
            <div 
                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-50 grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1.5s] ease-out mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
            
            {/* HUD / Data Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[80%] h-[60%] border border-white/10 relative group-hover:border-cyan-500/30 transition-colors duration-700">
                    {/* Corners */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/50"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-white/50"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-white/50"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/50"></div>
                    
                
                    
                </div>
            </div>

            

            
        </div>
    );
}


// --- AETHER (Cinematic Landing) ---
export function AetherPreview() {
    return (
        <div className="w-full h-full bg-black relative overflow-hidden flex flex-col items-center justify-center font-sans group">
             {/* Background Image Parallax Simulation */}
             <div 
                className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2560&auto=format&fit=crop')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[2s] ease-out"
             />
             
             {/* Overlay UI */}
             <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
             
             <div className="relative z-10 text-center space-y-4 transform group-hover:-translate-y-4 transition-transform duration-700">
                <h2 className="text-4xl md:text-5xl font-light tracking-tighter text-white mix-blend-difference">
                    AETHER
                </h2>
                <p className="text-[10px] tracking-[0.3em] text-gray-300 uppercase">
                    Beyond the Horizon
                </p>
             </div>

             
        </div>
    );
}
