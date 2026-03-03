import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type * as THREE from "three";
import type { Planet } from "@/types/planet";

type PlanetMeshProps = {
	planet: Planet;
};

export function PlanetMesh({ planet }: PlanetMeshProps) {
	const meshRef = useRef<THREE.Mesh>(null);

	// Load the texture (you can use any public Earth texture URL)
	const [colorMap] = useTexture([planet.texturePath]);

	// This hook runs every frame (approx 60fps)
	useFrame((_state, delta) => {
		if (meshRef.current) {
			// Rotate the planet on its Y-axis
			meshRef.current.rotation.y += delta * planet.rotationSpeedY;
			// 位置を planet.position に同期
			meshRef.current.position.set(
				planet.position.x,
				planet.position.y,
				planet.position.z,
			);
		}
	});

	return (
		<mesh
			ref={meshRef}
			position={[planet.position.x, planet.position.y, planet.position.z]}
		>
			{/* args: [radius, widthSegments, heightSegments]
        Higher segments = smoother sphere
      */}
			<sphereGeometry args={[planet.radius, planet.width, planet.height]} />
			<meshStandardMaterial map={colorMap} />
		</mesh>
	);
}
