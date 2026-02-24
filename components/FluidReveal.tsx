"use client";
import { Canvas, useFrame, extend, useThree } from "@react-three/fiber";
import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { usePerformance } from "@/context/PerformanceContext";

// Define the custom shader material
const FluidMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector2(0, 0),
    uResolution: new THREE.Vector2(1, 1),
    uHover: 0,
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform float uHover;
    varying vec2 vUv;

    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = vUv;
      
      // Aspect ratio correction for mouse interaction
      float aspect = uResolution.x / uResolution.y;
      vec2 mousePos = uMouse;
      mousePos.x *= aspect;
      vec2 currentPos = uv;
      currentPos.x *= aspect;

      // Calculate distance from mouse
      float dist = distance(currentPos, mousePos);
      
      // Fluid/Water effect logic
      float time = uTime * 0.5;
      
      // Create a flowing RGB pattern
      vec3 color = vec3(0.0);
      
      // Warping coordinates for fluid look
      vec2 q = vec2(0.);
      q.x = snoise(uv + vec2(0.0, time*0.1));
      q.y = snoise(uv + vec2(time*0.1, 0.0));
      
      vec2 r = vec2(0.);
      r.x = snoise(uv + 1.0*q + vec2(1.7, 9.2) + 0.15*time);
      r.y = snoise(uv + 1.0*q + vec2(8.3, 2.8) + 0.126*time);
      
      float f = snoise(uv + r);
      
      // Color palette based on noise - REFINED FOR "ELITE" AESTHETIC
      // Base: Deep metallic grey (Liquid Metal base)
      vec3 colorBase = vec3(0.05, 0.06, 0.08);
      // Mid: Silver/Platinum
      vec3 colorMid = vec3(0.6, 0.65, 0.7);
      // Highlight: Electric Cyan
      vec3 colorHigh = vec3(0.0, 0.9, 1.0);
      
      color = mix(colorBase, colorMid, clamp(f*f*2.5, 0.0, 1.0));
      // Sharp highlight for the "liquid" feel
      color = mix(color, colorHigh, pow(clamp(length(q), 0.0, 1.0), 4.0) * 0.8);
      
      // Add subtle chromatic aberration effect
      float shift = 0.01;
      float rChannel = snoise(uv + vec2(shift, 0.0) + r);
      float bChannel = snoise(uv - vec2(shift, 0.0) + r);
      color.r += rChannel * 0.1;
      color.b += bChannel * 0.1;
      
      // Add "water ripple" distortion near mouse
      float ripple = sin(dist * 30.0 - time * 8.0) * 0.015;
      
      // Reveal mask
      // Smooth circle that reveals the color
      float revealSize = 0.15; // Reduced from 0.25
      float mask = smoothstep(revealSize, revealSize - 0.1, dist + ripple * 0.5);
      
      // TRAIL EFFECT (Simulated in shader without buffer for simplicity/performance)
      // Create a secondary, larger but fainter trail based on time-delayed noise
      float trailNoise = snoise(currentPos * 2.0 - vec2(uMouse.x, uMouse.y) * 0.5 - time * 0.2);
      float trailDist = distance(currentPos, mousePos);
      float trailMask = smoothstep(0.25, 0.0, trailDist + trailNoise * 0.1) * 0.4; // Fainter, larger
      
      // Combine main mask and trail
      float finalMask = max(mask, trailMask);
      
      // Use mask for alpha instead of mixing with black
      // This allows the CSS background-color to show through where not revealed
      vec3 finalColor = color * 1.5; // Multiply color for vibrance
      
      gl_FragColor = vec4(finalColor, finalMask * uHover);
    }
  `
);

extend({ FluidMaterial });

function FluidPlane() {
  const materialRef = useRef<any>(null);
  const { viewport, size } = useThree();
  const [hovered, setHover] = useState(false);
  const mousePos = useRef(new THREE.Vector2(0.5, 0.5));

  // Global mouse tracking
  useEffect(() => {
    const updateMouse = (clientX: number, clientY: number) => {
        // Calculate mouse position relative to window (0..1)
        // Since the canvas is absolute in the section, and section scrolls,
        // we need to map the screen-space mouse to the canvas-space UV.
        
        // However, for this specific effect (reveal under cursor), 
        // we often want the effect to follow the cursor on SCREEN.
        // But the shader uses UVs of the mesh.
        
        // Let's keep it simple: Map window coordinates directly to UV space logic.
        // We need to account for the canvas element's position on screen.
        // Since we are inside R3F Canvas, the canvas element is gl.domElement
        // However, we are in a child component, so we can access it via useThree()
        
        // Let's use window size for UV normalization since this is a fullscreen-ish effect
        // or section-wide.
        // If the canvas is the size of the section, we can just use bounding rect.
        
        // Accessing DOM element from inside loop/event might be slow if we querySelector every time.
        // Let's try to get it from context if possible or just assume full window for now as fallback.
        
        const canvas = document.querySelector('canvas'); // This might grab the wrong canvas if multiple are present!
        // Better:
        const x = clientX / window.innerWidth;
        const y = 1 - (clientY / window.innerHeight);
        
        mousePos.current.set(x, y);
    };

    const handleMouseMove = (e: MouseEvent) => updateMouse(e.clientX, e.clientY);
    
    // Track scroll to update relative position even if mouse is static
    const handleScroll = () => {
        // We need the last known mouse position. 
        // Since we don't have it easily without global state, 
        // we can assume the user will move mouse or we rely on the fact 
        // that if they scroll, the element moves under the static cursor.
        // But `e` is missing.
        // Ideally we'd store lastMouse in a ref outside.
    };
    
    // Actually, let's just capture mousemove on window. 
    // And on scroll, we can't easily get mouse pos without tracking it.
    // BUT, the useCursor context or a global ref would be better.
    // For now, let's just listen to mousemove which fires often enough? 
    // No, scroll doesn't fire mousemove.
    
    // Hack: Use a global var or just attach to window.lastMouse if we had it.
    // Let's implement a local tracker.
    let lastX = 0;
    let lastY = 0;
    
    const onMove = (e: MouseEvent) => {
        lastX = e.clientX;
        lastY = e.clientY;
        updateMouse(lastX, lastY);
    }
    
    const onScroll = () => {
        // Recalculate with last known screen coordinates
        updateMouse(lastX, lastY);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    
    return () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime += delta;
      
      // Smoothly interpolate to target
      materialRef.current.uMouse.lerp(mousePos.current, 0.1);
      materialRef.current.uResolution.set(size.width, size.height);
      
      // Calculate distance from center (UV space 0.5, 0.5) to fade out if outside
      // This helps limit the effect visually to the container if needed, 
      // but the main issue is likely the global tracking affecting other sections.
      // We can check if mousePos is within 0..1 range.
      
      const isInside = mousePos.current.x >= 0 && mousePos.current.x <= 1 && 
                       mousePos.current.y >= 0 && mousePos.current.y <= 1;
      
      const targetHover = isInside ? 1 : 0;
      
      // Smoothly transition uHover
      materialRef.current.uHover = THREE.MathUtils.lerp(materialRef.current.uHover, targetHover, 0.1);
    }
  });

  return (
    <mesh 
      onPointerOver={() => setHover(true)} 
      onPointerOut={() => setHover(false)}
      scale={[viewport.width, viewport.height, 1]}
    >
      <planeGeometry args={[1, 1]} />
      {/* @ts-ignore */}
      <fluidMaterial ref={materialRef} transparent />
    </mesh>
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

export default function FluidReveal() {
  const [rendererKey, setRendererKey] = useState(0);
  const handleContextLost = useCallback(() => {
    setRendererKey((prev) => prev + 1);
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-auto bg-transparent">
      <Canvas key={rendererKey} camera={{ position: [0, 0, 1], fov: 75 }} dpr={[1, 1.25]} gl={{ alpha: true, antialias: true, powerPreference: "high-performance", stencil: false, depth: true }}>
        <WebGLContextHandler onLost={handleContextLost} />
        <FluidPlane />
      </Canvas>
    </div>
  );
}
