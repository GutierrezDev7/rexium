"use client";
import { useState, useMemo, useRef, useLayoutEffect, useEffect, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useLanguage } from "@/context/LanguageContext";

type CityConfig = {
  count: number;
  spread: number;
  maxHeight: number;
  seed: number;
};

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

type HouseData = {
  position: [number, number, number];
  width: number;
  depth: number;
  height: number;
  roofHeight: number;
  roofType: "gable" | "flat";
  bodyColor: string;
  roofColor: string;
  windowColor: string;
  windowRows: number;
  windowCols: number;
  rotationY: number;
  isCommercial: boolean;
};

type RoadStrip = {
  x: number;
  z: number;
  width: number;
  depth: number;
};

type SidewalkStrip = {
  x: number;
  z: number;
  width: number;
  depth: number;
};

type TreeInstance = {
  x: number;
  z: number;
  height: number;
  canopy: number;
};

type LightPole = {
  x: number;
  z: number;
  height: number;
};

type ParkPatch = {
  x: number;
  z: number;
  width: number;
  depth: number;
};

type NeighborhoodData = {
  buildings: HouseData[];
  roads: RoadStrip[];
  sidewalks: SidewalkStrip[];
  trees: TreeInstance[];
  lamps: LightPole[];
  parks: ParkPatch[];
};

function Neighborhood({ count, spread, maxHeight, seed }: CityConfig) {
  const data = useMemo<NeighborhoodData>(() => {
    const rng = createRng(seed);
    const blockCount = 3;
    const streetWidth = 2.4;
    const sidewalkWidth = 0.9;
    const totalSpan = Math.max(18, spread);
    const blockSize = Math.max(6, (totalSpan - (blockCount + 1) * streetWidth) / blockCount);
    const roadStart = -totalSpan / 2 + streetWidth / 2;
    const blockStart = roadStart + streetWidth / 2 + blockSize / 2;

    const roads: RoadStrip[] = [];
    const sidewalks: SidewalkStrip[] = [];
    const lamps: LightPole[] = [];
    const trees: TreeInstance[] = [];
    const parks: ParkPatch[] = [];
    const buildings: HouseData[] = [];

    for (let i = 0; i <= blockCount; i++) {
      const pos = roadStart + i * (blockSize + streetWidth);
      roads.push({ x: 0, z: pos, width: totalSpan, depth: streetWidth });
      roads.push({ x: pos, z: 0, width: streetWidth, depth: totalSpan });

      sidewalks.push({ x: 0, z: pos - streetWidth / 2 - sidewalkWidth / 2, width: totalSpan, depth: sidewalkWidth });
      sidewalks.push({ x: 0, z: pos + streetWidth / 2 + sidewalkWidth / 2, width: totalSpan, depth: sidewalkWidth });
      sidewalks.push({ x: pos - streetWidth / 2 - sidewalkWidth / 2, z: 0, width: sidewalkWidth, depth: totalSpan });
      sidewalks.push({ x: pos + streetWidth / 2 + sidewalkWidth / 2, z: 0, width: sidewalkWidth, depth: totalSpan });

      if (i % 2 === 0) {
        const poleHeight = 1.1 + rng() * 0.6;
        lamps.push({ x: pos, z: -totalSpan / 2 + streetWidth * 0.6, height: poleHeight });
        lamps.push({ x: pos, z: totalSpan / 2 - streetWidth * 0.6, height: poleHeight });
        lamps.push({ x: -totalSpan / 2 + streetWidth * 0.6, z: pos, height: poleHeight });
        lamps.push({ x: totalSpan / 2 - streetWidth * 0.6, z: pos, height: poleHeight });
      }
    }

    const lotBase = Math.max(2.4, blockSize / 4.2);
    const maxBuildings = Math.max(12, count);

    for (let bx = 0; bx < blockCount; bx++) {
      for (let bz = 0; bz < blockCount; bz++) {
        const centerX = blockStart + bx * (blockSize + streetWidth);
        const centerZ = blockStart + bz * (blockSize + streetWidth);
        const blockMinX = centerX - blockSize / 2;
        const blockMaxX = centerX + blockSize / 2;
        const blockMinZ = centerZ - blockSize / 2;
        const blockMaxZ = centerZ + blockSize / 2;
        const isCore = bx === 1 && bz === 1;

        if (rng() > 0.4) {
          const parkSize = blockSize * (0.28 + rng() * 0.18);
          parks.push({ x: centerX, z: centerZ, width: parkSize, depth: parkSize });
        }

        const lots = Math.max(2, Math.floor(blockSize / lotBase));
        const lotSpan = blockSize / lots;

        const addBuilding = (x: number, z: number, width: number, depth: number, rotationY: number, isCommercial: boolean) => {
          if (buildings.length >= maxBuildings) return;
          const heightBase = isCommercial ? maxHeight * 0.7 : maxHeight * 0.4;
          const height = Math.max(1.6, heightBase + rng() * (maxHeight * 0.6));
          const roofType = isCommercial ? "flat" : rng() > 0.2 ? "gable" : "flat";
          const roofHeight = Math.max(0.35, height * (isCommercial ? 0.18 : 0.28));
          const bodyColor = new THREE.Color().setHSL(0.55, 0.15 + rng() * 0.2, 0.22 + rng() * 0.35).getStyle();
          const roofColor = new THREE.Color().setHSL(0.08, 0.2, 0.2 + rng() * 0.2).getStyle();
          const windowColor = new THREE.Color().setHSL(0.55, 0.6, 0.6 + rng() * 0.2).getStyle();
          const windowRows = Math.min(5, Math.max(2, Math.floor(height)));
          const windowCols = Math.min(5, Math.max(2, Math.floor(width)));

          buildings.push({
            position: [x, 0, z],
            width,
            depth,
            height,
            roofHeight,
            roofType,
            bodyColor,
            roofColor,
            windowColor,
            windowRows,
            windowCols,
            rotationY,
            isCommercial,
          });
        };

        for (let i = 0; i < lots; i++) {
          const offset = (i + 0.5) * lotSpan;
          const setback = 0.6 + rng() * 0.3;
          const centerGap = 1.4;
          const widthLimit = Math.max(1.2, lotSpan - 0.6);
          const depthLimit = Math.max(1.2, blockSize / 2 - setback - centerGap / 2);
          const width = Math.min(lotBase * (0.75 + rng() * 0.45), widthLimit);
          const depth = Math.min(blockSize * (0.2 + rng() * 0.08), depthLimit);
          const mainStreet = bx === 1 || bz === 1;
          const commercial = isCore || (mainStreet && rng() > 0.6);

          addBuilding(
            blockMinX + offset,
            blockMaxZ - depth / 2 - setback,
            width,
            depth,
            0,
            commercial
          );
          addBuilding(
            blockMinX + offset,
            blockMinZ + depth / 2 + setback,
            width,
            depth,
            Math.PI,
            commercial
          );
          addBuilding(
            blockMaxX - depth / 2 - setback,
            blockMinZ + offset,
            width,
            depth,
            -Math.PI / 2,
            commercial
          );
          addBuilding(
            blockMinX + depth / 2 + setback,
            blockMinZ + offset,
            width,
            depth,
            Math.PI / 2,
            commercial
          );
        }

        for (let t = 0; t < 4; t++) {
          if (rng() > 0.5) {
            const cornerX = t % 2 === 0 ? blockMinX + sidewalkWidth * 0.8 : blockMaxX - sidewalkWidth * 0.8;
            const cornerZ = t < 2 ? blockMinZ + sidewalkWidth * 0.8 : blockMaxZ - sidewalkWidth * 0.8;
            trees.push({
              x: cornerX + (rng() - 0.5) * 0.4,
              z: cornerZ + (rng() - 0.5) * 0.4,
              height: 0.6 + rng() * 0.7,
              canopy: 0.5 + rng() * 0.6,
            });
          }
        }
      }
    }

    return { buildings, roads, sidewalks, trees, lamps, parks };
  }, [count, spread, maxHeight, seed]);

  return (
    <group>
      {data.parks.map((park, index) => (
        <mesh key={`park-${index}`} position={[park.x, 0.03, park.z]}>
          <boxGeometry args={[park.width, 0.08, park.depth]} />
          <meshStandardMaterial color="#0a1a12" roughness={0.9} metalness={0} />
        </mesh>
      ))}
      <RoadNetwork roads={data.roads} sidewalks={data.sidewalks} />
      <StreetFurniture trees={data.trees} lamps={data.lamps} />
      {data.buildings.map((house, index) => {
        const windowWidth = house.width * 0.12;
        const windowHeight = house.height * 0.12;
        const gapX = house.width / (house.windowCols + 1);
        const gapY = house.height / (house.windowRows + 1);
        const windowZ = house.depth / 2 + 0.01;

        return (
          <group key={index} position={house.position} rotation={[0, house.rotationY, 0]}>
            <mesh position={[0, house.height / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[house.width, house.height, house.depth]} />
              <meshStandardMaterial color={house.bodyColor} roughness={0.35} metalness={0.15} />
            </mesh>
            {house.roofType === "gable" ? (
              <mesh position={[0, house.height + house.roofHeight / 2, 0]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[house.width * 0.7, house.roofHeight, 4]} />
                <meshStandardMaterial color={house.roofColor} roughness={0.6} metalness={0.05} />
              </mesh>
            ) : (
              <mesh position={[0, house.height + house.roofHeight / 2, 0]}>
                <boxGeometry args={[house.width * 0.9, house.roofHeight, house.depth * 0.9]} />
                <meshStandardMaterial color={house.roofColor} roughness={0.6} metalness={0.05} />
              </mesh>
            )}
            <mesh position={[0, 0.2, house.depth / 2 + 0.03]}>
              <boxGeometry args={[house.width * 0.2, 0.4, 0.05]} />
              <meshStandardMaterial color="#1b1b1b" roughness={0.8} metalness={0.1} />
            </mesh>
            {house.isCommercial && (
              <mesh position={[0, house.height * 0.45, house.depth / 2 + 0.05]}>
                <boxGeometry args={[house.width * 0.6, 0.12, 0.2]} />
                <meshStandardMaterial color="#101418" roughness={0.4} metalness={0.2} />
              </mesh>
            )}
            {Array.from({ length: house.windowRows }).map((_, row) =>
              Array.from({ length: house.windowCols }).map((__, col) => (
                <mesh
                  key={`${row}-${col}`}
                  position={[
                    -house.width / 2 + gapX * (col + 1),
                    house.height / 2 - gapY * (row + 1),
                    windowZ,
                  ]}
                >
                  <planeGeometry args={[windowWidth, windowHeight]} />
                  <meshStandardMaterial color={house.windowColor} emissive={house.windowColor} emissiveIntensity={0.6} />
                </mesh>
              ))
            )}
          </group>
        );
      })}
    </group>
  );
}

function RoadNetwork({ roads, sidewalks }: { roads: RoadStrip[]; sidewalks: SidewalkStrip[] }) {
  const roadRef = useRef<THREE.InstancedMesh>(null);
  const sidewalkRef = useRef<THREE.InstancedMesh>(null);
  const roadObject = useMemo(() => new THREE.Object3D(), []);
  const sidewalkObject = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (roadRef.current) {
      roads.forEach((item, i) => {
        roadObject.position.set(item.x, 0.01, item.z);
        roadObject.scale.set(item.width, 0.02, item.depth);
        roadObject.updateMatrix();
        roadRef.current!.setMatrixAt(i, roadObject.matrix);
      });
      roadRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [roads, roadObject]);

  useLayoutEffect(() => {
    if (sidewalkRef.current) {
      sidewalks.forEach((item, i) => {
        sidewalkObject.position.set(item.x, 0.02, item.z);
        sidewalkObject.scale.set(item.width, 0.03, item.depth);
        sidewalkObject.updateMatrix();
        sidewalkRef.current!.setMatrixAt(i, sidewalkObject.matrix);
      });
      sidewalkRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [sidewalks, sidewalkObject]);

  return (
    <group>
      <instancedMesh ref={roadRef} args={[undefined, undefined, roads.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={sidewalkRef} args={[undefined, undefined, sidewalks.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0f0f0f" roughness={0.8} metalness={0.05} />
      </instancedMesh>
    </group>
  );
}

function StreetFurniture({ trees, lamps }: { trees: TreeInstance[]; lamps: LightPole[] }) {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const canopyRef = useRef<THREE.InstancedMesh>(null);
  const poleRef = useRef<THREE.InstancedMesh>(null);
  const bulbRef = useRef<THREE.InstancedMesh>(null);
  const trunkObject = useMemo(() => new THREE.Object3D(), []);
  const canopyObject = useMemo(() => new THREE.Object3D(), []);
  const poleObject = useMemo(() => new THREE.Object3D(), []);
  const bulbObject = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (trunkRef.current && canopyRef.current) {
      trees.forEach((item, i) => {
        trunkObject.position.set(item.x, item.height / 2, item.z);
        trunkObject.scale.set(0.12, item.height, 0.12);
        trunkObject.updateMatrix();
        trunkRef.current!.setMatrixAt(i, trunkObject.matrix);

        canopyObject.position.set(item.x, item.height + item.canopy * 0.35, item.z);
        canopyObject.scale.set(item.canopy, item.canopy, item.canopy);
        canopyObject.updateMatrix();
        canopyRef.current!.setMatrixAt(i, canopyObject.matrix);
      });
      trunkRef.current.instanceMatrix.needsUpdate = true;
      canopyRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [trees, trunkObject, canopyObject]);

  useLayoutEffect(() => {
    if (poleRef.current && bulbRef.current) {
      lamps.forEach((item, i) => {
        poleObject.position.set(item.x, item.height / 2, item.z);
        poleObject.scale.set(0.08, item.height, 0.08);
        poleObject.updateMatrix();
        poleRef.current!.setMatrixAt(i, poleObject.matrix);

        bulbObject.position.set(item.x, item.height + 0.08, item.z);
        bulbObject.scale.set(0.12, 0.12, 0.12);
        bulbObject.updateMatrix();
        bulbRef.current!.setMatrixAt(i, bulbObject.matrix);
      });
      poleRef.current.instanceMatrix.needsUpdate = true;
      bulbRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [lamps, poleObject, bulbObject]);

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 6]} />
        <meshStandardMaterial color="#3b2a1a" roughness={0.8} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={canopyRef} args={[undefined, undefined, trees.length]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#0b3a24" roughness={0.7} metalness={0} />
      </instancedMesh>
      <instancedMesh ref={poleRef} args={[undefined, undefined, lamps.length]}>
        <cylinderGeometry args={[0.5, 0.5, 1, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.2} />
      </instancedMesh>
      <instancedMesh ref={bulbRef} args={[undefined, undefined, lamps.length]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color="#87d7ff" emissive="#7fd0ff" emissiveIntensity={0.9} />
      </instancedMesh>
    </group>
  );
}

function Scene({ config }: { config: CityConfig }) {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 20, 10]} intensity={0.9} color="#00ffff" />
      <pointLight position={[-10, 12, -10]} intensity={0.4} color="#ff00ff" />
      <fog attach="fog" args={["#040404", 20, 120]} />
      
      <Neighborhood 
        count={config.count} 
        spread={config.spread} 
        maxHeight={config.maxHeight}
        seed={config.seed}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#050505" roughness={1} metalness={0} />
      </mesh>
      
      <Stars radius={100} depth={50} count={2500} factor={4} saturation={0} fade speed={1} />
      <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={true} maxPolarAngle={Math.PI / 2.2} />
      <Environment preset="city" />
    </>
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

export default function OrionDeepDive() {
  const { t } = useLanguage();
  const [rendererKey, setRendererKey] = useState(0);
  const [config, setConfig] = useState<CityConfig>({
    count: 64,
    spread: 18,
    maxHeight: 8,
    seed: 1
  });

  const regenerate = () => {
    setConfig(prev => ({ ...prev, seed: prev.seed + 1 }));
  };

  const handleContextLost = useCallback(() => {
    setRendererKey((prev) => prev + 1);
  }, []);

  return (
    <div className="w-full h-full bg-black relative font-mono">
      {/* UI Controls Overlay */}
      <div className="absolute top-0 left-0 p-8 z-10 w-80 pointer-events-none">
        <div className="pointer-events-auto bg-black/80 backdrop-blur-md border border-white/10 p-6 rounded-sm space-y-6">
          <div>
            <h2 className="text-2xl text-white font-bold tracking-tighter">{t.deepDives.orion.title}</h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{t.deepDives.orion.subtitle}</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{t.deepDives.orion.buildings}</span>
                <span>{config.count} {t.deepDives.orion.units}</span>
              </div>
              <input 
                type="range" 
                min="16" 
                max="144" 
                step="8"
                value={config.count}
                onChange={(e) => setConfig({ ...config, count: Number(e.target.value) })}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{t.deepDives.orion.height}</span>
                <span>{config.maxHeight}m</span>
              </div>
              <input 
                type="range" 
                min="4" 
                max="14" 
                step="1"
                value={config.maxHeight}
                onChange={(e) => setConfig({ ...config, maxHeight: Number(e.target.value) })}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>

             <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>{t.deepDives.orion.footprint}</span>
                <span>{config.spread}m</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="30" 
                step="2"
                value={config.spread}
                onChange={(e) => setConfig({ ...config, spread: Number(e.target.value) })}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
          </div>

          <button 
            onClick={regenerate}
            className="w-full py-3 border border-cyan-500/50 text-cyan-400 text-xs uppercase tracking-widest hover:bg-cyan-500/10 transition-colors"
          >
            {t.deepDives.orion.regenerate}
          </button>
        </div>
        
        <div className="mt-4 text-[10px] text-gray-600 space-y-1">
           <p>RENDER_ENGINE: WEBGL_2.0</p>
           <p>SHADER_MODEL: PBR_STANDARD</p>
           <p>DETAIL_MODE: ARCHITECTURAL</p>
        </div>
      </div>

      <Canvas key={rendererKey} camera={{ position: [20, 20, 20], fov: 45 }} onCreated={({ gl }) => gl.setClearColor('#000000')} gl={{ powerPreference: "high-performance", antialias: true, alpha: false, stencil: false, depth: true }} dpr={[1, 1.25]}>
        <WebGLContextHandler onLost={handleContextLost} />
        <Scene config={config} />
      </Canvas>
    </div>
  );
}
