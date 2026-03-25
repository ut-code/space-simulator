import { Trail, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Planet } from "@/types/planet";
import { GravitySystem } from "../core/GravitySystem";
import type { PlanetRegistry } from "../core/PlanetRegistry";
import {
	CollisionType,
	decideCollisionOutcome,
} from "../utils/decideCollisionOutcome";
import { mergePlanets } from "../utils/mergePlanets";

const FALLBACK_TEXTURE =
	"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

type PlanetMeshProps = {
	planetId: string;
	planetRegistry: PlanetRegistry;
	onExplosion: (position: THREE.Vector3, radius: number) => void;
	onSelect: (planetId: string) => void;
	onMerge: (idA: string, idB: string, newData: Planet) => void;
};

export function PlanetMesh({
	planetId,
	planetRegistry,
	onExplosion,
	onSelect,
	onMerge,
}: PlanetMeshProps) {
	const meshRef = useRef<THREE.Mesh>(null);
	const texturePath =
		planetRegistry.get(planetId)?.texturePath ?? FALLBACK_TEXTURE;

	const [colorMap] = useTexture([texturePath]);

	useEffect(() => {
		const entry = planetRegistry.get(planetId);
		if (meshRef.current && entry) {
			meshRef.current.position.copy(entry.position);
		}
		return () => {
			planetRegistry.unregister(planetId);
		};
	}, [planetId, planetRegistry]);

	const gravitySystem = useMemo(() => new GravitySystem(), []);
	const forceAccumulator = useMemo(() => new THREE.Vector3(), []);
	const positionVec = useMemo(() => new THREE.Vector3(), []);
	const velocityVec = useMemo(() => new THREE.Vector3(), []);

	useFrame((_, delta) => {
		if (!meshRef.current) return;
		const current = planetRegistry.get(planetId);
		if (!current) return;

		forceAccumulator.set(0, 0, 0);

		gravitySystem.accumulateForPlanet({
			planetId,
			targetMass: current.mass,
			targetRadius: current.radius,
			targetPosition: current.position,
			planetRegistry,
			outForce: forceAccumulator,
		});

		planetRegistry.update(
			planetId,
			forceAccumulator.divideScalar(current.mass),
			delta,
		);

		positionVec.copy(current.position);
		velocityVec.copy(current.velocity);

		for (const [otherId, other] of planetRegistry) {
			if (otherId === planetId) continue;

			const otherPos = other.position;

			const dx = otherPos.x - positionVec.x;
			const dy = otherPos.y - positionVec.y;
			const dz = otherPos.z - positionVec.z;
			const distSq = dx * dx + dy * dy + dz * dz;

			const minDist = current.radius + other.radius;

			if (distSq <= minDist * minDist) {
				if (planetId < otherId) {
					const result: string = decideCollisionOutcome(
						current.mass,
						current.radius,
						positionVec.clone(),
						velocityVec.clone(),
						other.mass,
						other.radius,
						other.position.clone(),
						other.velocity.clone(),
					);

					if (result === CollisionType.Merge) {
						const newData = mergePlanets(
							current.mass,
							current.radius,
							positionVec.clone(),
							velocityVec.clone(),
							current.rotationSpeedY,
							other.mass,
							other.radius,
							other.position.clone(),
							other.velocity.clone(),
							other.rotationSpeedY,
						);
						onMerge(planetId, otherId, newData);
					} else {
						const collisionPoint = positionVec.clone();
						onExplosion(collisionPoint, minDist);
					}
				}
			}
		}
		meshRef.current.position.copy(positionVec);
		meshRef.current.rotation.y += current.rotationSpeedY * delta;
	}, 0);

	const renderPlanet = planetRegistry.get(planetId);
	if (!renderPlanet) return null;

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
