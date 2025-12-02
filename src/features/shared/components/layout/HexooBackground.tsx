"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

const COUNT = 400; // Number of hexagons
const FUCHSIA = new THREE.Color("#DB38F0");
const CYAN = new THREE.Color("#00FFFF");

function HexSwarm() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  // Generate random initial data for each hexagon
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < COUNT; i++) {
      const t = Math.random() * 100;
      const speed = 0.01 + Math.random() / 50;
      // Scatter them widely in space
      const x = (Math.random() - 0.5) * 50;
      const y = (Math.random() - 0.5) * 50;
      const z = (Math.random() - 0.5) * 30;
      // Random scale
      const scale = Math.random();

      // Color: randomly mix fuchsia and cyan
      const colorMix = Math.random();

      temp.push({ t, speed, x, y, z, scale, colorMix });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.getElapsedTime();

    // Loop through all particles
    particles.forEach((particle, i) => {
      let { t, speed, x, y, z, scale, colorMix } = particle;

      // Waving motion (sine wave)
      // Each hexagon slowly "breathes" its position
      const yOffset = Math.sin(t + time * speed) * 2;
      const rotX = Math.sin(t + time * 0.2) * Math.PI;
      const rotY = Math.cos(t + time * 0.2) * Math.PI;

      // Set position and rotation
      dummy.position.set(x, y + yOffset, z);
      dummy.rotation.set(rotX, rotY, 0);
      dummy.scale.set(scale, scale, scale);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      // Set color (mix of fuchsia and cyan)
      // Add a slight brightness pulse
      meshRef.current!.setColorAt(i, color.lerpColors(FUCHSIA, CYAN, colorMix));
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    // meshRef.current.instanceColor.needsUpdate = true; // Uncomment if colors should change over time

    // The entire swarm slowly rotates
    meshRef.current.rotation.y = time * 0.05;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      {/* Geometry: Cylinder with 6 sides = HEXAGON */}
      {/* args: [radiusTop, radiusBottom, height, radialSegments] */}
      <cylinderGeometry args={[1, 1, 0.1, 6]} />
      <meshBasicMaterial
        wireframe
        transparent
        opacity={0.3}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

export default function HexooBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#050505]">
      <Canvas camera={{ position: [0, 0, 25], fov: 60 }}>
        {/* Background */}
        <color attach="background" args={["#050505"]} />

        {/* Fog - crucial for hexagons to disappear in the distance */}
        <fog attach="fog" args={["#050505", 10, 40]} />

        <HexSwarm />
      </Canvas>

      {/* Vignette - darkens the corners */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
    </div>
  );
}
