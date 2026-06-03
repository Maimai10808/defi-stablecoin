"use client";

import * as React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type Motion3DNodeProps = { position: [number, number, number]; radius?: number; active?: boolean; label?: string; reduceMotion?: boolean };

export function Motion3DNode({ position, radius = 0.42, active = false, reduceMotion = false }: Motion3DNodeProps) {
  const groupRef = React.useRef<THREE.Group>(null);
  const meshRef = React.useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!groupRef.current || !meshRef.current) return;
    if (reduceMotion) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = position[1] + Math.sin(t * 1.2 + position[0]) * 0.08;
    meshRef.current.rotation.x += 0.004;
    meshRef.current.rotation.y += 0.007;
  });
  return (
    <group ref={groupRef} position={position}>
      <mesh ref={meshRef}>
        <dodecahedronGeometry args={[radius, 0]} />
        <meshStandardMaterial color={active ? "#f8fafc" : "#64748b"} metalness={0.85} roughness={0.22} emissive={active ? "#38bdf8" : "#0f172a"} emissiveIntensity={active ? 0.7 : 0.15} />
      </mesh>
      <mesh scale={1.22}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial transparent opacity={active ? 0.1 : 0.04} color="#ffffff" />
      </mesh>
    </group>
  );
}
