"use client";

import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { Motion3DNode } from "./motion-3d-node";

function RotatingProtocolGraph({ active = true, reduceMotion = false }: { active?: boolean; reduceMotion?: boolean }) {
  const groupRef = React.useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!groupRef.current) return;
    if (reduceMotion) return;
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.22) * 0.22;
    groupRef.current.rotation.x = 0.12 + Math.sin(state.clock.elapsedTime * 0.17) * 0.04;
  });
  return (
    <group ref={groupRef}>
      <Motion3DNode position={[-2.7, 0, 0]} active={active} reduceMotion={reduceMotion} />
      <Motion3DNode position={[-0.9, 0.9, 0]} active={active} radius={0.5} reduceMotion={reduceMotion} />
      <Motion3DNode position={[0.9, 0.9, 0]} active={active} radius={0.5} reduceMotion={reduceMotion} />
      <Motion3DNode position={[2.7, 0, 0]} active={active} reduceMotion={reduceMotion} />
      {[[-2.7,0,0,-0.9,0.9,0],[-0.9,0.9,0,0.9,0.9,0],[0.9,0.9,0,2.7,0,0]].map((line,index)=>(
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array(line), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={active ? "#93c5fd" : "#64748b"} transparent opacity={0.55} />
        </line>
      ))}
    </group>
  );
}

export type Motion3DSceneProps = { active?: boolean; className?: string };

export function Motion3DScene({ active = true, className }: Motion3DSceneProps) {
  const reduceMotion = useReducedMotion();
  return (
    <div className={`h-[360px] w-full min-w-0 max-w-full overflow-hidden rounded-xl border bg-muted/20 [contain:layout_paint] ${className ?? ""}`}>
      <Canvas camera={{ position: [0, 2.1, 6.2], fov: 45 }}>
        <ambientLight intensity={0.75} />
        <directionalLight position={[4, 5, 6]} intensity={1.7} />
        <pointLight position={[-4, 2, 3]} intensity={1.2} />
        <RotatingProtocolGraph active={active} reduceMotion={Boolean(reduceMotion)} />
      </Canvas>
    </div>
  );
}
