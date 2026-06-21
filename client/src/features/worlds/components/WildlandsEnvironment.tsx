/**
 * WildlandsEnvironment — Immersive 3D forest scene for The Wildlands world.
 * Uses React Three Fiber with dynamic evolution-based visuals.
 * Trees grow, grass heals, fireflies appear, and sky brightens as progress increases.
 */

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

// ── Individual Tree Component ───────────────────────────────────
function Tree({ position, scale, growth = 1 }: { position: [number, number, number]; scale?: number; growth?: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const s = (scale ?? 1) * (0.5 + growth * 0.5);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.3 + position[0]) * 0.02;
    }
  });

  return (
    <group position={position} scale={s}>
      {/* Trunk */}
      <mesh position={[0, 0.5 * growth, 0]}>
        <cylinderGeometry args={[0.08, 0.12, growth]} />
        <meshStandardMaterial color="#5D4037" roughness={0.9} />
      </mesh>
      {/* Foliage layers */}
      {[0.6, 0.9, 1.2].map((h, i) => (
        <mesh key={i} position={[0, h * growth, 0]}>
          <sphereGeometry args={[0.5 - i * 0.1, 6, 6]} />
          <meshStandardMaterial
            color={i === 0 ? "#2E7D32" : i === 1 ? "#388E3C" : "#43A047"}
            roughness={0.8}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

// ── Flower Component ────────────────────────────────────────────
function Flower({ position, bloom = 0.5 }: { position: [number, number, number]; bloom?: number }) {
  const colors = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#FF8E53"];
  const color = useMemo(() => colors[Math.floor(Math.random() * colors.length)], []);
  const scale = 0.15 + bloom * 0.25;

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.3, 6, 6]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.02, 0.04, 0.15]} />
        <meshStandardMaterial color="#4CAF50" />
      </mesh>
    </group>
  );
}

// ── Firefly Particles (uses Points for performance) ─────────────
function Fireflies({ intensity = 0.5 }) {
  const count = Math.floor(15 + intensity * 25);
  
  const { positions, sizes } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sizesArr = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 1] = 0.2 + Math.random() * 3;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      sizesArr[i] = 0.02 + Math.random() * 0.04;
    }
    return { positions: pos, sizes: sizesArr };
  }, [count]);

  const fireflyRef = useRef<THREE.Points>(null!);

  useFrame(({ clock }) => {
    if (fireflyRef.current) {
      const time = clock.getElapsedTime();
      const pos = fireflyRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += Math.sin(time * 0.5 + i) * 0.001;
      }
      fireflyRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Pulse opacity
      const mat = fireflyRef.current.material as THREE.PointsMaterial;
      mat.opacity = 0.3 + Math.sin(time * 2) * 0.25;
    }
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <points ref={fireflyRef} geometry={geometry}>
      <pointsMaterial
        color="#FFE082"
        size={0.06}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

// ── Ground Terrain ──────────────────────────────────────────────
function Terrain({ evolution }: { evolution: number }) {
  const grassColor = useMemo(() => {
    const t = evolution / 100;
    const r = 0.2 + t * 0.15;
    const g = 0.5 + t * 0.3;
    const b = 0.15 + t * 0.1;
    return new THREE.Color(r, g, b);
  }, [evolution]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
      <planeGeometry args={[12, 12, 32, 32]} />
      <meshStandardMaterial color={grassColor} roughness={0.9} metalness={0} />
    </mesh>
  );
}

// ── Main Scene ──────────────────────────────────────────────────
function WildlandsScene({ evolution = 50 }: { evolution?: number }) {
  const growthFactor = Math.min(1, evolution / 100);
  const treePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    // Ring layout for trees
    for (let ring = 0; ring < 3; ring++) {
      const count = 5 - ring;
      const radius = 1.5 + ring * 1.5;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + ring * 0.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        positions.push([x, 0, z]);
      }
    }
    return positions;
  }, []);

  const flowerPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1 + Math.random() * 4;
      positions.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius]);
    }
    return positions;
  }, []);

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.4 + growthFactor * 0.3} />
      <directionalLight position={[5, 8, 5]} intensity={0.6 + growthFactor * 0.3} color="#FFE0B2" />
      <hemisphereLight
        args={[new THREE.Color("#87CEEB"), new THREE.Color("#4CAF50"), 0.4 + growthFactor * 0.2]}
      />

      {/* Sky glow - brightens with evolution */}
      <mesh scale={[20, 20, 20]}>
        <sphereGeometry args={[1, 16, 16]} />
        <MeshDistortMaterial
          color={new THREE.Color(`hsl(${120 + growthFactor * 40}, 40%, ${30 + growthFactor * 30}%)`)}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
          distort={0.2}
        />
      </mesh>

      {/* Ground */}
      <Terrain evolution={evolution} />

      {/* Trees */}
      {treePositions.map((pos, i) => (
        <Float key={i} speed={0.5 + Math.random() * 0.5} rotationIntensity={0.02} floatIntensity={0.05}>
          <Tree position={pos} scale={0.8 + Math.random() * 0.4} growth={growthFactor} />
        </Float>
      ))}

      {/* Flowers */}
      {growthFactor > 0.2 && flowerPositions.map((pos, i) => (
        <Float key={i} speed={0.8} floatIntensity={0.1}>
          <Flower position={pos} bloom={growthFactor} />
        </Float>
      ))}

      {/* Fireflies */}
      <Fireflies intensity={growthFactor} />

      {/* Stars/dust particles */}
      <Sparkles
        count={Math.floor(30 + growthFactor * 50)}
        scale={8}
        size={0.05 + growthFactor * 0.08}
        speed={0.3}
        color="#FFE082"
      />
    </>
  );
}

// ── Loading Fallback ────────────────────────────────────────────
function EnvironmentFallback() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 to-teal-600/30 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20" />
          <div className="absolute inset-1 border-t-2 border-emerald-300 rounded-full animate-spin" />
        </div>
        <span className="text-[10px] font-bold text-emerald-300/60 uppercase tracking-widest">
          Forest Loading...
        </span>
      </div>
    </div>
  );
}

// ── Exportable Component ────────────────────────────────────────
export default function WildlandsEnvironment({ evolution = 50, className = "" }: { evolution?: number; className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden rounded-3xl ${className}`}>
      <Canvas
        camera={{ position: [0, 3, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
        fallback={<EnvironmentFallback />}
      >
        <Suspense fallback={null}>
          <WildlandsScene evolution={evolution} />
        </Suspense>
      </Canvas>
    </div>
  );
}
