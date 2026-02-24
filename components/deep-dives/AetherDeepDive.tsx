"use client";
import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ScrollControls, Scroll, useScroll, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useLanguage } from "@/context/LanguageContext";

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const scroll = useScroll();
  
  // Generate random particles
  const particlesCount = 5000;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20; // x
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10; // z
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      // Rotate based on scroll and time
      const scrollOffset = scroll.offset; // 0 to 1
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05 + scrollOffset * Math.PI;
      pointsRef.current.rotation.x = scrollOffset * Math.PI * 0.2;
      pointsRef.current.position.z = scrollOffset * 5; // Move camera forward effect
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.03}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

function SceneContent() {
    const scroll = useScroll();
    const [opacity, setOpacity] = useState(1);

    useFrame(() => {
        // Fade out initial text on scroll
        setOpacity(1 - scroll.range(0, 0.3));
    });

    return (
        <group>
            <ParticleField />
        </group>
    );
}

function WebGLContextHandler({ onLost }: { onLost?: () => void }) {
  const { gl, invalidate } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;

    const handleLost = (event: Event) => {
      event.preventDefault();
      onLost?.();
    };

    const handleRestore = () => {
      invalidate();
    };

    canvas.addEventListener("webglcontextlost", handleLost, false);
    canvas.addEventListener("webglcontextrestored", handleRestore, false);

    return () => {
      canvas.removeEventListener("webglcontextlost", handleLost, false);
      canvas.removeEventListener("webglcontextrestored", handleRestore, false);
    };
  }, [gl, invalidate, onLost]);

  return null;
}

export default function AetherDeepDive() {
  const { t } = useLanguage();
  const [rendererKey, setRendererKey] = useState(0);
  const handleContextLost = useCallback(() => {
    setRendererKey((prev) => prev + 1);
  }, []);

  return (
    <div className="w-full h-full bg-black relative" style={{ backgroundColor: '#000000' }}>
      <Canvas key={rendererKey} camera={{ position: [0, 0, 5], fov: 60 }} onCreated={({ gl }) => gl.setClearColor('#000000')} dpr={[1, 1.25]} gl={{ powerPreference: "high-performance", antialias: true, alpha: false, stencil: false, depth: true }}>
        <WebGLContextHandler onLost={handleContextLost} />
        <ScrollControls pages={4} damping={0.2}>
            <SceneContent />
            <Scroll html style={{ width: '100%', height: '100%' }}>
                {/* Section 1: Intro */}
                <div className="w-full h-screen flex flex-col items-center justify-center pointer-events-none">
                    <h1 className="text-[12vw] font-bold text-white tracking-tighter leading-none mix-blend-difference">
                        {t.deepDives.aether.title}
                    </h1>
                    <p className="text-sm text-gray-400 tracking-[0.5em] uppercase mt-4">
                        {t.deepDives.aether.subtitle}
                    </p>
                    <div className="absolute bottom-12 animate-bounce text-gray-500 text-xs">{t.deepDives.aether.scroll}</div>
                </div>

                {/* Section 2: Narrative */}
                <div className="w-full h-screen flex items-center justify-end px-24 pointer-events-none">
                    <div className="max-w-xl text-right">
                        <h2 className="text-4xl text-white font-light mb-6">{t.deepDives.aether.s1.title}</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            {t.deepDives.aether.s1.desc}
                        </p>
                    </div>
                </div>

                {/* Section 3: Immersion */}
                <div className="w-full h-screen flex items-center justify-start px-24 pointer-events-none">
                     <div className="max-w-xl text-left">
                        <h2 className="text-4xl text-white font-light mb-6">{t.deepDives.aether.s2.title}</h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            {t.deepDives.aether.s2.desc}
                        </p>
                    </div>
                </div>

                {/* Section 4: CTA */}
                <div className="w-full h-screen flex flex-col items-center justify-center pointer-events-auto">
                    <h2 className="text-6xl text-white font-bold mb-12 tracking-tight">{t.deepDives.aether.cta.title}</h2>
                    <button className="px-12 py-4 bg-white text-black text-sm font-bold tracking-[0.2em] hover:bg-gray-200 transition-all hover:scale-105">
                        {t.deepDives.aether.cta.button}
                    </button>
                </div>
            </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
}
