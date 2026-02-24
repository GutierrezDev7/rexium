"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Environment, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useLanguage } from "@/context/LanguageContext";

function AnimatedSphere({ color, roughness, metalness, distort }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
        meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
        meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Sphere args={[1, 128, 128]} scale={1.6} ref={meshRef}>
            <MeshDistortMaterial
                color={color}
                attach="material"
                distort={distort}
                speed={2}
                roughness={roughness}
                metalness={metalness}
                envMapIntensity={1}
            />
        </Sphere>
    </Float>
  );
}

function WebGLContextHandler({ onLost, onRestored }: { onLost?: () => void; onRestored?: () => void }) {
  const { gl, invalidate } = useThree();

  useEffect(() => {
    const canvas = gl.domElement;

    const handleLost = (event: Event) => {
      event.preventDefault();
      onLost?.();
    };

    const handleRestore = () => {
      invalidate();
      onRestored?.();
    };

    canvas.addEventListener("webglcontextlost", handleLost, false);
    canvas.addEventListener("webglcontextrestored", handleRestore, false);

    return () => {
      canvas.removeEventListener("webglcontextlost", handleLost, false);
      canvas.removeEventListener("webglcontextrestored", handleRestore, false);
    };
  }, [gl, invalidate, onLost, onRestored]);

  return null;
}

export default function KronosDeepDive() {
  const { t } = useLanguage();
  const [rendererKey, setRendererKey] = useState(0);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [config, setConfig] = useState({
    color: "#e0e0e0",
    roughness: 0.1,
    metalness: 0.9,
    distort: 0.4,
    env: "studio"
  });

  const colors = ["#e0e0e0", "#ffD700", "#ff4d4d", "#00bfff", "#1a1a1a"];

  const handleContextLost = useCallback(() => {
    setRendererKey((prev) => prev + 1);
  }, []);

  return (
    <div className="w-full h-full relative bg-black" style={{ background: 'linear-gradient(to bottom, #1a1a1a, #000000)' }}>
        <Canvas key={rendererKey} camera={{ position: [0, 0, 5], fov: 45 }} gl={{ powerPreference: "high-performance", antialias: true, alpha: false, stencil: false, depth: true }} dpr={[1, 1.25]} onCreated={({ gl }) => gl.setClearColor('#000000')}>
            <WebGLContextHandler onLost={handleContextLost} />
            <Environment preset={config.env as any} />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />
            
            <Stars radius={100} depth={50} count={2500} factor={4} saturation={0} fade speed={1} />
            
            <AnimatedSphere {...config} />
            
            {/* Removed ContactShadows to prevent WebGL Context Lost */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]}>
                <planeGeometry args={[10, 10]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.5} />
            </mesh>
            
            <OrbitControls enableZoom={false} enablePan={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.5} />
        </Canvas>
        
        {/* Toggle Button for Mobile */}
        <button 
            className="absolute bottom-8 left-1/2 -translate-x-1/2 md:hidden z-20 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full text-xs uppercase tracking-widest"
            onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
        >
            {isMobilePanelOpen ? 'Close Config' : 'Configure'}
        </button>

        {/* Interactive UI Overlay - Responsive Panel */}
        <div className={`absolute top-0 right-0 h-full w-full md:w-80 bg-[#050505]/90 backdrop-blur-xl border-l border-white/10 p-8 flex flex-col justify-center transition-transform duration-500 ease-out z-10 ${isMobilePanelOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'}`}>
            <div className="md:hidden absolute top-4 right-4">
                <button onClick={() => setIsMobilePanelOpen(false)} className="text-white p-2">✕</button>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-1 tracking-tighter">{t.deepDives.kronos.title}</h2>
            <p className="text-xs text-gray-400 mb-8 uppercase tracking-widest">{t.deepDives.kronos.subtitle}</p>
            
            <div className="space-y-8 overflow-y-auto md:overflow-visible max-h-[60vh] md:max-h-none pr-2">
                {/* Color Picker */}
                <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 block">{t.deepDives.kronos.material}</label>
                    <div className="flex gap-3 flex-wrap">
                        {colors.map(c => (
                            <button
                                key={c}
                                onClick={() => setConfig(prev => ({ ...prev, color: c }))}
                                className={`w-8 h-8 rounded-full border-2 transition-all duration-300 ${config.color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>
                </div>

                {/* Sliders */}
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                            <span>{t.deepDives.kronos.roughness}</span>
                            <span>{(config.roughness * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                            type="range" min="0" max="1" step="0.01" 
                            value={config.roughness}
                            onChange={(e) => setConfig(prev => ({ ...prev, roughness: parseFloat(e.target.value) }))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                            <span>{t.deepDives.kronos.metalness}</span>
                            <span>{(config.metalness * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                            type="range" min="0" max="1" step="0.01" 
                            value={config.metalness}
                            onChange={(e) => setConfig(prev => ({ ...prev, metalness: parseFloat(e.target.value) }))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                            <span>{t.deepDives.kronos.fluidity}</span>
                            <span>{(config.distort * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                            type="range" min="0" max="1" step="0.01" 
                            value={config.distort}
                            onChange={(e) => setConfig(prev => ({ ...prev, distort: parseFloat(e.target.value) }))}
                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                        />
                    </div>
                </div>
                
                {/* Environment */}
                <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 block">{t.deepDives.kronos.lighting}</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['studio', 'city', 'sunset', 'dawn'].map(env => (
                            <button
                                key={env}
                                onClick={() => setConfig(prev => ({ ...prev, env }))}
                                className={`px-3 py-2 text-[10px] uppercase border transition-all ${config.env === env ? 'bg-white text-black border-white' : 'bg-transparent text-gray-400 border-white/20 hover:border-white/50'}`}
                            >
                                {env}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-8 border-t border-white/10">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] text-gray-500">{t.deepDives.kronos.price}</p>
                        <p className="text-xl text-white font-mono">$ 849.00</p>
                    </div>
                    <button className="bg-white text-black px-6 py-2 text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors w-full md:w-auto">
                        {t.deepDives.kronos.addToCart}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}
