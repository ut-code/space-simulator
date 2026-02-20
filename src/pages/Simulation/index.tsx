import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import type * as THREE from "three";
import { Explosion } from "@/components/Explosion";
import { earth, testPlanet } from "@/data/planets";
import type { Planet } from "@/types/planet";
import { isColliding } from "@/utils/isColliding";

const testPlanets: Planet[] = [earth, testPlanet];

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
interface SimulationProps {
	planets: Planet[];
	setExplosions: React.Dispatch<React.SetStateAction<Planet[]>>;
}

export function Simulation({ planets, setExplosions }: SimulationProps) {
	// 前フレームの衝突ペアを記録して、連続爆発を防ぐ
	const collidedPairsRef = useRef<Set<string>>(new Set());

	useFrame((_state, delta) => {
		// 並進運動
		for (let i = 0; i < planets.length; i++) {
			if (planets[i].velocity) {
				planets[i].position.addScaledVector(planets[i].velocity, delta);
			}
		}

		// 衝突判定
		for (let i = 0; i < planets.length; i++) {
			for (let j = i + 1; j < planets.length; j++) {
				const a = planets[i];
				const b = planets[j];
				const key = `${i}-${j}`;

				if (isColliding(a, b)) {
					if (!collidedPairsRef.current.has(key)) {
						collidedPairsRef.current.add(key);

						// 衝突したら爆発を追加
						setExplosions((prev) => [...prev, a, b]);

						console.log(`Collision detected between planet ${i} and ${j}`);
					}
				} else {
					// 衝突していない場合は記録を削除
					collidedPairsRef.current.delete(key);
				}
			}
		}
	});

	return null;
}

export default function Page() {
	const [explosions, setExplosions] = useState<Planet[]>([]);

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

			{testPlanets.map((planet) => (
				<PlanetMesh key={planet.name} planet={planet} />
			))}
			<Simulation planets={testPlanets} setExplosions={setExplosions} />
			{explosions.map((exp, idx) => (
				<Explosion key={idx} planet={exp} />
			))}

			{/* Optional background and controls */}
			<Stars
				radius={100}
				depth={50}
				count={5000}
				factor={4}
				saturation={0}
				fade
				speed={1}
			/>
			<OrbitControls enableZoom={true} />
		</Canvas>
	);
}
