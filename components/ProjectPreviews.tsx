"use client";
import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Environment, Stage } from "@react-three/drei";

// --- KRONOS (3D E-commerce) ---
function ProductModel() {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (mesh.current) {
        mesh.current.rotation.y = state.clock.getElapsedTime() * 0.5;
        mesh.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Sphere ref={mesh} args={[1, 64, 64]} scale={1.6}>
            <MeshDistortMaterial
                color="#e0e0e0"
                roughness={0.1}
                metalness={0.9}
                distort={0.3}
                speed={2}
            />
        </Sphere>
    </Float>
  );
}

export function KronosPreview() {
  return (
    <div className="w-full h-full bg-[#0a0a0a] relative overflow-hidden group">
      
      
      

      <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 2]}>
         <Environment preset="studio" />
         <ambientLight intensity={0.5} />
         <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
         <ProductModel />
      </Canvas>
    </div>
  );
}

// --- ORION (Procedural Architecture) ---
function CityBlock({ position, scale, color }: any) {
    const mesh = useRef<THREE.Mesh>(null);
    const [hovered, setHover] = useState(false);
    
    useFrame((state) => {
        if(mesh.current && hovered) {
             mesh.current.rotation.y += 0.02;
        }
    });

    return (
        <mesh 
            ref={mesh}
            position={position} 
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            <boxGeometry args={scale} />
            <meshStandardMaterial 
                color={hovered ? "#00ffff" : color} 
                roughness={0.2}
                metalness={0.8}
                emissive={hovered ? "#00ffff" : "#000000"}
                emissiveIntensity={hovered ? 0.5 : 0}
            />
            <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(scale[0], scale[1], scale[2])]} />
                <lineBasicMaterial color={hovered ? "#ffffff" : "#333333"} transparent opacity={0.2} />
            </lineSegments>
        </mesh>
    );
}

export function OrionPreview() {
    // Generate a denser grid of blocks
    const blocks = useMemo(() => {
        const items = [];
        for (let x = -2; x <= 2; x++) {
            for (let z = -2; z <= 2; z++) {
                // Skip center for visual interest
                if (x === 0 && z === 0) continue;
                
                const height = Math.random() * 3 + 0.5;
                items.push({
                    position: [x * 1.2, height / 2, z * 1.2],
                    scale: [1, height, 1],
                    color: Math.random() > 0.8 ? "#333" : "#111",
                });
            }
        }
        // Center tower
        items.push({
            position: [0, 2.5, 0],
            scale: [1.5, 5, 1.5],
            color: "#0a0a0a"
        });
        return items;
    }, []);

    return (
        <div className="w-full h-full bg-[#080808] relative overflow-hidden group">
            

            <div className="absolute bottom-6 right-6 z-10 font-mono text-xs text-right">
                <div className="text-white mb-1">SEED: 8492X</div>
                
            </div>

            <Canvas camera={{ position: [8, 8, 8], fov: 35 }} dpr={[1, 2]}>
                <color attach="background" args={['#050505']} />
                <fog attach="fog" args={['#050505', 5, 20]} />
                <ambientLight intensity={0.2} />
                <directionalLight position={[10, 10, 5]} intensity={1} color="#00ffff" />
                <pointLight position={[-5, 5, -5]} intensity={0.5} color="#ff00ff" />
                
                <group rotation={[0, Math.PI / 4, 0]}>
                    <Stage environment="city" intensity={0.5} adjustCamera={false}>
                        {blocks.map((block, i) => (
                            <CityBlock key={i} {...block} />
                        ))}
                    </Stage>
                </group>
                <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2} />
            </Canvas>
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

             <div className="absolute bottom-8 left-8 z-10 flex gap-4 text-[10px] text-white/50 font-mono">
                <span>SCROLL</span>
                <div className="w-12 h-[1px] bg-white/20 my-auto"></div>
             </div>
        </div>
    );
}
