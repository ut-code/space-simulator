import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Planet } from "@/types/planet";
import { earth } from "@/data/planets";

interface PlanetMeshProps {
  planet: Planet;
}

function PlanetMesh({ planet }: PlanetMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Load the texture (you can use any public Earth texture URL)
  const [colorMap] = useTexture([planet.texturePath]);

  // This hook runs every frame (approx 60fps)
  useFrame((_state, delta) => {
    if (meshRef.current) {
      // Rotate the planet on its Y-axis
      meshRef.current.rotation.y += delta * planet.rotationSpeedY;
    }
  });

  return (
    <mesh ref={meshRef} position={[planet.position.x, planet.position.y, planet.position.z]}>
      {/* args: [radius, widthSegments, heightSegments]
        Higher segments = smoother sphere
      */}
      <sphereGeometry args={[planet.radius, planet.width, planet.height]} />
      <meshStandardMaterial map={colorMap} />
    </mesh>
  );
}

export default function Page() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6] }}
      onCreated={({ gl }) => {
        gl.setClearColor("#000000", 1);
      }}
      style={{ width: "100vw", height: "100vh" }}
    >
      {/* Adds ambient and directional light so we can see the 3D shape */}
      <ambientLight intensity={1.2} />
      <pointLight position={[10, 10, 10]} intensity={3} />

      <PlanetMesh planet={earth} />

      {/* Optional background and controls */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <OrbitControls enableZoom={true} />
    </Canvas>
  );
}
