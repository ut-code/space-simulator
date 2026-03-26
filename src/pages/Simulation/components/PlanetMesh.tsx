import { Trail, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type * as THREE from "three";
import type { PlanetRegistry } from "../core/PlanetRegistry";

const FALLBACK_TEXTURE =
	"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

type PlanetMeshProps = {
	planetId: string;
	planetRegistry: PlanetRegistry;
	onSelect: (planetId: string) => void;
};

export function PlanetMesh({
	planetId,
	planetRegistry,
	onSelect,
}: PlanetMeshProps) {
	const meshRef = useRef<THREE.Mesh>(null);
	const texturePath =
		planetRegistry.get(planetId)?.texturePath ?? FALLBACK_TEXTURE;

	const [colorMap] = useTexture([texturePath]);

	// Initialize mesh position from registry on mount
	useEffect(() => {
		const entry = planetRegistry.get(planetId);
		if (meshRef.current && entry) {
			meshRef.current.position.copy(entry.position);
		}
	}, [planetId, planetRegistry]);

	// Update mesh to match physics state every frame (rendering only)
	useFrame((_, delta) => {
		if (!meshRef.current) return;
		const current = planetRegistry.get(planetId);
		if (!current) return;

		// Validate position before copying to prevent NaN propagation
		if (
			Number.isFinite(current.position.x) &&
			Number.isFinite(current.position.y) &&
			Number.isFinite(current.position.z)
		) {
			// Sync mesh position with physics state
			meshRef.current.position.copy(current.position);
		}

		// Update rotation (visual only, not physics)
		meshRef.current.rotation.y += current.rotationSpeedY * delta;
	});

	const renderPlanet = planetRegistry.get(planetId);
	if (!renderPlanet) return null;

	// Ensure valid position values for rendering
	const hasValidPosition =
		Number.isFinite(renderPlanet.position.x) &&
		Number.isFinite(renderPlanet.position.y) &&
		Number.isFinite(renderPlanet.position.z);

	if (!hasValidPosition) {
		console.warn(`Planet ${planetId} has invalid position, skipping render`);
		return null;
	}

	return (
		<Trail
			width={renderPlanet.radius}
			length={80}
			color="#88ccff"
			attenuation={(t) => t}
		>
			{/* biome-ignore lint: noStaticElementInteractions - Three.js mesh is not a DOM element*/}
			<mesh
				ref={meshRef}
				position={[
					renderPlanet.position.x,
					renderPlanet.position.y,
					renderPlanet.position.z,
				]}
				onDoubleClick={(e) => {
					e.stopPropagation();
					onSelect(planetId);
				}}
			>
				<sphereGeometry
					args={[renderPlanet.radius, renderPlanet.width, renderPlanet.height]}
				/>
				<meshStandardMaterial map={colorMap} />
			</mesh>
		</Trail>
	);
}
