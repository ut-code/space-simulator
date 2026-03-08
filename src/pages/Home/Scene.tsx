import { useFrame, useLoader } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { earth, jupiter, mars, sun, venus } from "@/data/planets";
import type { Planet } from "@/types/planet";

export default function HomeScene() {
	const planets = [earth, jupiter, mars, sun, venus];
	const planet: Planet = planets[Math.floor(Math.random() * planets.length)];
	const texture = useLoader(THREE.TextureLoader, planet.texturePath);
	const planetRef = useRef<THREE.Mesh>(null);

	useFrame((_, delta) => {
		if (planetRef.current) {
			planetRef.current.rotation.y += delta * 0.2;
		}
	});

	return (
		<>
			<ambientLight intensity={1} />

			<mesh ref={planetRef} position={[3, 0, -5]}>
				<sphereGeometry args={[2, planet.width, planet.height]} />
				<meshStandardMaterial map={texture} />
			</mesh>
		</>
	);
}
