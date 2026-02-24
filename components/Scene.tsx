"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import * as THREE from "three";

const createRng = (seed: number) => {
  let t = seed + 0x6d2b79f5;
  return () => {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

function GalaxyLayer({
  count,
  radius,
  depth,
  size,
  opacity,
  colorA,
  colorB,
  speed,
  seed,
}: {
  count: number;
  radius: number;
  depth: number;
  size: number;
  opacity: number;
  colorA: string;
  colorB: string;
  speed: number;
  seed: number;
}) {
  const mesh = useRef<THREE.Points>(null);
  const { mouse, viewport } = useThree();
  
  const { positions, colors } = useMemo(() => {
    const rng = createRng(seed);
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const cA = new THREE.Color(colorA);
    const cB = new THREE.Color(colorB);
    for (let i = 0; i < count; i++) {
      const r = Math.sqrt(rng()) * radius;
      const angle = rng() * Math.PI * 2 + r * 0.25;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = (rng() - 0.5) * depth;
      pos.set([x, y, z], i * 3);
      const t = Math.min(1, r / radius);
      const c = cA.clone().lerp(cB, t);
      col.set([c.r, c.g, c.b], i * 3);
    }
    return { positions: pos, colors: col };
  }, [count, radius, depth, colorA, colorB, seed]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.getElapsedTime() * speed;
      mesh.current.rotation.x = Math.sin(state.clock.getElapsedTime() * speed * 1.2) * 0.06;
      
      if (mouse && viewport) {
        const x = (mouse.x * viewport.width) / 50;
        const y = (mouse.y * viewport.height) / 50;
        mesh.current.rotation.x += y * 0.1;
        mesh.current.rotation.y += x * 0.1;
      }
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        transparent
        opacity={opacity}
        sizeAttenuation={true}
        blending={THREE.AdditiveBlending}
        vertexColors
      />
    </points>
  );
}

function Fog() {
    return <fog attach="fog" args={['#050505', 3, 15]} />
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

export default function Scene({ blendMode = "screen", opacity = 0.8 }: { blendMode?: "screen" | "normal"; opacity?: number }) {
  const [rendererKey, setRendererKey] = useState(0);
  const handleContextLost = useCallback(() => {
    setRendererKey((prev) => prev + 1);
  }, []);

  return (
    <div
      className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ease-in-out"
      style={{ opacity, mixBlendMode: blendMode }}
    >
      <Canvas key={rendererKey} camera={{ position: [0, 0, 5], fov: 75 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance", stencil: false, depth: true }} dpr={[1, 1.1]}>
        <WebGLContextHandler onLost={handleContextLost} />
        <Fog />
        <GalaxyLayer count={1600} radius={12} depth={6} size={0.02} opacity={0.5} colorA="#8fd3ff" colorB="#3a6fd1" speed={0.05} seed={42} />
        <GalaxyLayer count={800} radius={6} depth={3} size={0.03} opacity={0.75} colorA="#ffffff" colorB="#7fb2ff" speed={0.08} seed={1337} />
        <GalaxyLayer count={500} radius={18} depth={10} size={0.015} opacity={0.3} colorA="#6b7cff" colorB="#1b2b6f" speed={0.02} seed={7} />
      </Canvas>
    </div>
  );
}
