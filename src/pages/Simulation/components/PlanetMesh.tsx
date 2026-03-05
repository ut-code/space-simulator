import { useSphere } from "@react-three/cannon";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type React from "react";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Planet } from "@/types/planet";
import { calc_gravity_force } from "../utils/UniversalGravitation";

type PlanetMeshProps = {
	planet: Planet;
	planetRegistry: ReturnType<typeof React.useRef<Map<string, THREE.Mesh>>>;
	onExplosion: (position: THREE.Vector3, radius: number) => void;
};

export function PlanetMesh({
	planet,
	planetRegistry,
	onExplosion,
}: PlanetMeshProps) {
	const [ref, api] = useSphere<THREE.Mesh>(
		() => ({
			mass: planet.mass,
			args: [planet.radius],
			position: [planet.position.x, planet.position.y, planet.position.z],
			velocity: [planet.velocity.x, planet.velocity.y, planet.velocity.z],
			angularVelocity: [0, planet.rotationSpeedY, 0], // 物理エンジンでY軸周りの角速度を設定
			linearDamping: 0, // 宇宙空間なので抵抗なし
			angularDamping: 0, // 宇宙空間なので回転の減衰もない
			onCollide: (e) => {
				// 衝突時の衝撃が一定以上なら爆発とみなす
				if (e.contact.impactVelocity > 0.5) {
					const contactPoint = new THREE.Vector3(
						e.contact.contactPoint[0],
						e.contact.contactPoint[1],
						e.contact.contactPoint[2],
					);
					onExplosion(contactPoint, planet.radius);
				}
			},
		}),
		useRef<THREE.Mesh>(null),
	);

	// Load the texture (you can use any public Earth texture URL)
	const [colorMap] = useTexture([planet.texturePath]);

	// マウント時に自分のMeshをレジストリに登録し、他の惑星から参照できるようにする
	useEffect(() => {
		if (!planetRegistry.current) return;

		if (ref.current) {
			// 質量計算用にuserDataに保存
			ref.current.userData = {
				mass: planet.mass,
				id: planet.id,
				radius: planet.radius,
			};
			planetRegistry.current.set(planet.id, ref.current);
		}
		return () => {
			if (planetRegistry.current) {
				planetRegistry.current.delete(planet.id);
			}
		};
	}, [planet.id, planetRegistry, planet.mass, planet.radius, ref]);

	// 計算用ベクトルをメモリに保持しておく（毎フレームnewしないため）
	const forceAccumulator = useMemo(() => new THREE.Vector3(), []);

	// This hook runs every frame (approx 60fps)
	useFrame(() => {
		if (!ref.current || !planetRegistry.current) return;

		const myPos = ref.current.position;
		forceAccumulator.set(0, 0, 0); // 毎フレームリセットして使い回す

		// 他のすべての惑星からの引力を計算して合算
		planetRegistry.current.forEach((otherMesh, otherId) => {
			if (otherId === planet.id) return;

			const otherPos = otherMesh.position;
			const otherMass = otherMesh.userData.mass || 1;
			const otherRadius = otherMesh.userData.radius || 0.1;

			const force = calc_gravity_force(
				myPos,
				planet.mass,
				planet.radius,
				otherPos,
				otherMass,
				otherRadius,
			);
			forceAccumulator.add(force);
		});

		// 計算した力を重心に適用
		api.applyForce(forceAccumulator.toArray(), myPos.toArray());
	});

	return (
		<mesh ref={ref}>
			{/* args: [radius, widthSegments, heightSegments]
        Higher segments = smoother sphere
      */}
			<sphereGeometry args={[planet.radius, planet.width, planet.height]} />
			<meshStandardMaterial map={colorMap} />
		</mesh>
	);
}
