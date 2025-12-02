"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Stars } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

function UncannyOrganism() {
  const blobRef = useRef<THREE.Mesh>(null);
  const cageRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (blobRef.current) {
      // The blob pulses and rotates slowly
      blobRef.current.rotation.x = t * 0.2;
      blobRef.current.rotation.y = t * 0.3;

      // Reacts to the cursor - "looks" at it (speeds up)
      const speed = hovered ? 1.5 : 0.5;
      blobRef.current.rotation.z += 0.01 * speed;
    }

    if (cageRef.current) {
      // The cage rotates the other way
      cageRef.current.rotation.x = -t * 0.1;
      cageRef.current.rotation.y = -t * 0.1;

      // Breathing effect for the cage
      const scale = 1.5 + Math.sin(t * 0.5) * 0.1;
      cageRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* 1. INNER ORGANISM (Blob) */}
      <Float speed={4} rotationIntensity={1} floatIntensity={2}>
        <mesh
          ref={blobRef}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
          scale={hovered ? 1.2 : 1}
        >
          {/* Icosahedron gives a more "crystal/organic" shape than a sphere */}
          <icosahedronGeometry args={[1, 30]} />
          <MeshDistortMaterial
            color={hovered ? "#d94dff" : "#a21caf"} // Changes hue on hover
            envMapIntensity={1}
            clearcoat={1}
            clearcoatRoughness={0}
            metalness={0.9} // Looks like liquid metal
            roughness={0.1}
            distort={0.5} // Distortion strength
            speed={2} // "Boiling" speed
          />
        </mesh>
      </Float>

      {/* 2. OUTER CAGE (Wireframe) */}
      <mesh ref={cageRef}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial
          color="#ffffff"
          wireframe
          transparent
          opacity={0.1} /* Very subtle wireframe */
        />
      </mesh>
    </group>
  );
}

export default function Hexoo3D() {
  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden bg-black/40 border border-primary-neutral-stroke-default relative group cursor-grab active:cursor-grabbing">
      {/* Vignette and scanline effect (optional, for mood) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] z-10" />

      <div className="absolute bottom-3 right-4 text-[10px] font-mono text-white/20 z-20 tracking-widest">
        HEXOO_CORE
      </div>

      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        {/* Dark space background */}
        <color attach="background" args={["#050505"]} />
        {/* Stars in the background add depth */}
        <Stars
          radius={100}
          depth={50}
          count={1000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        {/* Lights - cyberpunk colors */}
        <ambientLight intensity={0.5} />
        <pointLight
          position={[10, 10, 10]}
          intensity={1.5}
          color="#d94dff"
        />{" "}
        {/* Fuchsia */}
        <pointLight
          position={[-10, -10, -10]}
          intensity={1}
          color="#00ffff"
        />{" "}
        {/* Cyan (counter) */}
        <UncannyOrganism />
      </Canvas>
    </div>
  );
}
