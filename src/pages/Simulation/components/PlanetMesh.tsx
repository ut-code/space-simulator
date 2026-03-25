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

type PlanetMeshProps = {
	planet: Planet;
	planetRegistry: PlanetRegistry;
	onExplosion: (position: THREE.Vector3, radius: number) => void;
	onSelect: (planetId: string) => void;
	onMerge: (idA: string, idB: string, newData: Planet) => void;
};

export function PlanetMesh({
	planet,
	planetRegistry,
	onExplosion,
	onSelect,
	onMerge,
}: PlanetMeshProps) {
	const meshRef = useRef<THREE.Mesh>(null);

	// Load the texture (you can use any public Earth texture URL)
	const [colorMap] = useTexture([planet.texturePath]);

	// マウント時に自分のMeshをレジストリに登録し、他の惑星から参照できるようにする
	useEffect(() => {
		if (meshRef.current) {
			planetRegistry.register(planet.id, {
				mass: planet.mass,
				radius: planet.radius,
				rotationSpeedY: planet.rotationSpeedY,
				position: planet.position,
				velocity: planet.velocity,
			});
			// 初期位置の設定
			meshRef.current.position.copy(
				new THREE.Vector3(
					planet.position.x,
					planet.position.y,
					planet.position.z,
				),
			);
		}
		return () => {
			planetRegistry.unregister(planet.id);
		};
	}, [
		planet.id,
		planetRegistry,
		planet.mass,
		planet.radius,
		planet.rotationSpeedY,
		planet.position,
		planet.velocity,
	]);

	// 計算用ベクトルをメモリに保持しておく（毎フレームnewしないため）
	//const planetInfo = useMemo(() => planetRegistry.get(planet.id), []);
	const gravitySystem = useMemo(() => new GravitySystem(), []);
	const forceAccumulator = useMemo(() => new THREE.Vector3(), []);
	const positionVec = useMemo(() => new THREE.Vector3(), []);
	const velocityVec = useMemo(() => new THREE.Vector3(), []);

	// This hook runs every frame (approx 60fps)
	useFrame((_, delta) => {
		if (!meshRef.current) return;

		// 力をリセット
		forceAccumulator.set(0, 0, 0);

		// 重力の計算
		gravitySystem.accumulateForPlanet({
			planetId: planet.id,
			targetMass: planet.mass,
			targetRadius: planet.radius,
			targetPosition:
				planetRegistry.get(planet.id)?.position ?? planet.position,
			planetRegistry,
			outForce: forceAccumulator,
		});

		// 物理更新
		planetRegistry.update(
			planet.id,
			forceAccumulator.divideScalar(planet.mass),
			delta,
		);

		positionVec.copy(
			planetRegistry.get(planet.id)?.position ?? planet.position,
		);
		velocityVec.copy(
			planetRegistry.get(planet.id)?.velocity ?? planet.velocity,
		);

		// ===== 衝突判定ここから =====
		for (const [otherId, other] of planetRegistry) {
			if (otherId === planet.id) continue;

			const otherPos = other.position;

			const dx = otherPos.x - positionVec.x;
			const dy = otherPos.y - positionVec.y;
			const dz = otherPos.z - positionVec.z;
			const distSq = dx * dx + dy * dy + dz * dz;

			const otherRadius = other.radius;
			const minDist = planet.radius + otherRadius;

			if (distSq <= minDist * minDist) {
				// 衝突発生

				if (planet.id < otherId) {
					const result: string = decideCollisionOutcome(
						planet.mass,
						planet.radius,
						positionVec.clone(),
						velocityVec.clone(),
						other.mass,
						other.radius,
						other.position.clone(),
						other.velocity.clone(),
					);

					if (result === CollisionType.Merge) {
						const newData = mergePlanets(
							planet.mass,
							planet.radius,
							positionVec.clone(),
							velocityVec.clone(),
							planet.rotationSpeedY,
							other.mass,
							other.radius,
							other.position.clone(),
							other.velocity.clone(),
							other.rotationSpeedY,
						);
						onMerge(planet.id, otherId, newData);
					} else {
						const collisionPoint = positionVec.clone();
						onExplosion(collisionPoint, minDist);
					}
				}
			}
		}
		// ===== 衝突判定ここまで =====

		// Meshへの反映
		meshRef.current.position.copy(positionVec);

		// 自転
		meshRef.current.rotation.y += planet.rotationSpeedY * delta;
	}, 0);

	return (
		<Trail
			width={planet.radius}
			length={80}
			color="#88ccff"
			attenuation={(t) => t}
		>
			{/* biome-ignore lint: noStaticElementInteractions - Three.js mesh is not a DOM element*/}
			<mesh
				ref={meshRef}
				onDoubleClick={(e) => {
					e.stopPropagation();
					onSelect(planet.id);
				}}
			>
				{/* args: [radius, widthSegments, heightSegments]
        Higher segments = smoother sphere
      */}
				<sphereGeometry args={[planet.radius, planet.width, planet.height]} />
				<meshStandardMaterial map={colorMap} />
			</mesh>
		</Trail>
	);
}
