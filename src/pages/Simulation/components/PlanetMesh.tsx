import { Trail, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Planet } from "@/types/planet";
import { GravitySystem } from "../core/GravitySystem";
import type {
	PlanetRegistry,
	PositionRef,
	VelocityRef,
} from "../core/PlanetRegistry";
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

	// 物理演算用の状態（再レンダリングでリセットされないようにRefで保持）
	const positionVecRef = useRef(
		new THREE.Vector3(planet.position.x, planet.position.y, planet.position.z),
	);
	const velocityVecRef = useRef(
		new THREE.Vector3(planet.velocity.x, planet.velocity.y, planet.velocity.z),
	);

	// Load the texture (you can use any public Earth texture URL)
	const [colorMap] = useTexture([planet.texturePath]);

	// Registry参照用オブジェクト（他の惑星から参照される）
	const positionRef = useMemo<PositionRef>(
		() => ({
			current: [planet.position.x, planet.position.y, planet.position.z],
		}),
		[planet.position.x, planet.position.y, planet.position.z],
	);
	const velocityRef = useMemo<VelocityRef>(
		() => ({
			current: [planet.velocity.x, planet.velocity.y, planet.velocity.z],
		}),
		[planet.velocity.x, planet.velocity.y, planet.velocity.z],
	);

	// マウント時に自分のMeshをレジストリに登録し、他の惑星から参照できるようにする
	useEffect(() => {
		if (meshRef.current) {
			// 質量計算用にuserDataに保存
			meshRef.current.userData = {
				mass: planet.mass,
				id: planet.id,
				radius: planet.radius,
				rotationSpeedY: planet.rotationSpeedY,
			};
			planetRegistry.register(planet.id, {
				mesh: meshRef.current,
				position: positionRef,
				velocity: velocityRef,
			});
			// 初期位置の設定
			meshRef.current.position.copy(positionVecRef.current);
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
		positionRef,
		velocityRef,
	]);

	// 計算用ベクトルをメモリに保持しておく（毎フレームnewしないため）
	const gravitySystem = useMemo(() => new GravitySystem(), []);
	const forceAccumulator = useMemo(() => new THREE.Vector3(), []);

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
			targetPosition: positionVecRef.current,
			planetRegistry,
			outForce: forceAccumulator,
		});

		// 物理更新 (オイラー法)
		// a = F / m
		const acceleration = forceAccumulator.divideScalar(planet.mass);

		// v = v + a * dt
		velocityVecRef.current.addScaledVector(acceleration, delta);

		// p = p + v * dt
		positionVecRef.current.addScaledVector(velocityVecRef.current, delta);

		// ===== 衝突判定ここから =====
		for (const [otherId, other] of planetRegistry) {
			if (otherId === planet.id) continue;

			const otherPos = other.position.current;

			const dx = otherPos[0] - positionVecRef.current.x;
			const dy = otherPos[1] - positionVecRef.current.y;
			const dz = otherPos[2] - positionVecRef.current.z;

			const distSq = dx * dx + dy * dy + dz * dz;

			const otherRadius = other.mesh.userData.radius;
			const minDist = planet.radius + otherRadius;

			if (distSq <= minDist * minDist) {
				// 衝突発生

				if (planet.id < otherId) {
					const result: string = decideCollisionOutcome(
						planet.mass,
						planet.radius,
						positionVecRef.current.clone(),
						velocityVecRef.current.clone(),
						other.mesh.userData.mass,
						other.mesh.userData.radius,
						new THREE.Vector3(
							other.position.current[0],
							other.position.current[1],
							other.position.current[2],
						),
						new THREE.Vector3(
							other.velocity.current[0],
							other.velocity.current[1],
							other.velocity.current[2],
						),
					);

					if (result === CollisionType.Merge) {
						const newData = mergePlanets(
							planet.mass,
							planet.radius,
							positionVecRef.current.clone(),
							velocityVecRef.current.clone(),
							planet.rotationSpeedY,
							other.mesh.userData.mass,
							other.mesh.userData.radius,
							new THREE.Vector3(
								other.position.current[0],
								other.position.current[1],
								other.position.current[2],
							),
							new THREE.Vector3(
								other.velocity.current[0],
								other.velocity.current[1],
								other.velocity.current[2],
							),
							other.mesh.userData.rotationSpeedY,
						);
						onMerge(planet.id, otherId, newData);
					} else {
						const collisionPoint = positionVecRef.current.clone();
						onExplosion(collisionPoint, minDist);
					}
				}
			}
		}
		// ===== 衝突判定ここまで =====

		// Meshへの反映
		meshRef.current.position.copy(positionVecRef.current);

		// 自転
		meshRef.current.rotation.y += planet.rotationSpeedY * delta;

		//Registry用の位置参照を更新
		positionRef.current = [
			positionVecRef.current.x,
			positionVecRef.current.y,
			positionVecRef.current.z,
		];
		velocityRef.current = [
			velocityVecRef.current.x,
			velocityVecRef.current.y,
			velocityVecRef.current.z,
		];
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
