"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

// COLORS
const BRAND_FUCHSIA = "#d946ef"; // Core
const BRAND_CYAN = "#06b6d4"; // Grid
const BRAND_BG = "#121212"; // Background

function GeometricCore() {
  const coreRef = useRef<THREE.Mesh>(null);
  const cageRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (coreRef.current) {
      // Mechanical, stable rotation
      coreRef.current.rotation.x = t * 0.2;
      coreRef.current.rotation.y = t * 0.2;

      // The core "swells" slightly on hover
      const targetScale = hovered ? 1.1 : 1.0;
      coreRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }

    if (cageRef.current) {
      // The cage rotates faster, technically
      cageRef.current.rotation.x = -t * 0.1;
      cageRef.current.rotation.z = t * 0.05;
    }
  });

  return (
    <group>
      {/* 1. ANGULAR CORE (Fuchsia) */}
      <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh
          ref={coreRef}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
        >
          {/* args={[1, 0]} is the key to angularity - the simplest Icosahedron (20 faces) */}
          <icosahedronGeometry args={[1, 0]} />

          <MeshDistortMaterial
            color={BRAND_FUCHSIA}
            emissive={BRAND_FUCHSIA}
            emissiveIntensity={0.3} // Internal energy
            // KEY TO ANGULARITY:
            flatShading={true} // Disables smoothing, each face is visible
            metalness={0.9} // Very metallic
            roughness={0.1} // Very shiny
            distort={0.3} // Distortion "breaks" the geometry, not melts it
            speed={2} // Fast, glitchy changes
            envMapIntensity={2} // Sharp reflections
          />
        </mesh>
      </Float>

      {/* 2. TECHNICAL GRID (Cyan) */}
      <mesh ref={cageRef}>
        {/* Slightly larger geometry */}
        <icosahedronGeometry args={[1.3, 0]} />
        <meshBasicMaterial
          color={BRAND_CYAN}
          wireframe // Only lines
          transparent
          opacity={0.3} // More visible than before
        />
      </mesh>
    </group>
  );
}

export default function Hexoo3D() {
  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden glass-card  relative group cursor-grab active:cursor-grabbing">
      {/* Background and vignette */}
      <div className="absolute inset-0 bg-[#121212]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_20%,#000_120%)] z-10" />

      {/* Label */}
      <div className="absolute bottom-4 right-5 text-[10px] font-mono text-cyan-500/40 z-20 tracking-widest uppercase">
        System: Active
      </div>

      <Canvas camera={{ position: [0, 0, 4], fov: 40 }}>
        <color attach="background" args={[BRAND_BG]} />

        {/* Studio Lighting for sharp edges */}
        <Environment preset="warehouse" />

        <ambientLight intensity={0.5} />

        {/* Cyan light (cold) */}
        <pointLight
          position={[-10, -10, -10]}
          intensity={2}
          color={BRAND_CYAN}
        />

        {/* White light (sharp, drawing edges) */}
        <spotLight
          position={[10, 10, 10]}
          angle={0.5}
          penumbra={1}
          intensity={2}
          color="white"
        />

        <GeometricCore />
      </Canvas>
    </div>
  );
}
