import { useSphere } from "@react-three/cannon";
import { Trail, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import type { Planet } from "@/types/planet";
import { GravitySystem } from "../core/GravitySystem";
import type { PlanetRegistry, PositionRef } from "../core/PlanetRegistry";

type PlanetMeshProps = {
	planet: Planet;
	planetRegistry: PlanetRegistry;
	onExplosion: (position: THREE.Vector3, radius: number) => void;
	onSelect: (planetId: string) => void;
};

export function PlanetMesh({
	planet,
	planetRegistry,
	onExplosion,
	onSelect,
}: PlanetMeshProps) {
	const [ref, api] = useSphere<THREE.Mesh>(() => ({
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
	}));

	// Load the texture (you can use any public Earth texture URL)
	const [colorMap] = useTexture([planet.texturePath]);

	const position = useMemo<PositionRef>(
		() => ({
			current: [planet.position.x, planet.position.y, planet.position.z],
		}),
		[planet.position.x, planet.position.y, planet.position.z],
	);
	useEffect(() => {
		const unsubscribe = api.position.subscribe((v) => {
			position.current = v;
		});
		return () => unsubscribe(); // アンマウント時に購読解除
	}, [api.position, position]);

	// マウント時に自分のMeshをレジストリに登録し、他の惑星から参照できるようにする
	useEffect(() => {
		if (ref.current) {
			// 質量計算用にuserDataに保存
			ref.current.userData = {
				mass: planet.mass,
				id: planet.id,
				radius: planet.radius,
			};
			planetRegistry.register(planet.id, {
				mesh: ref.current,
				position,
			});
		}
		return () => {
			planetRegistry.unregister(planet.id);
		};
	}, [planet.id, planetRegistry, planet.mass, planet.radius, ref, position]);

	// 計算用ベクトルをメモリに保持しておく（毎フレームnewしないため）
	const gravitySystem = useMemo(() => new GravitySystem(), []);
	const forceAccumulator = useMemo(() => new THREE.Vector3(), []);
	const myPosVec = useMemo(() => new THREE.Vector3(), []);

	// This hook runs every frame (approx 60fps)
	useFrame(() => {
		if (!ref.current) return;

		// 誤差による自転速度の異常上昇を防ぐ
		api.angularVelocity.set(0, planet.rotationSpeedY, 0);

		// ref.current.positionの代わりに、物理エンジンから取得した位置を使用
		myPosVec.fromArray(position.current);

		gravitySystem.accumulateForPlanet({
			planetId: planet.id,
			targetMass: planet.mass,
			targetRadius: planet.radius,
			targetPosition: myPosVec,
			planetRegistry,
			outForce: forceAccumulator,
		});

		// 計算した力を重心に適用
		api.applyForce(forceAccumulator.toArray(), myPosVec.toArray());
	});

	return (
		<Trail
			width={planet.radius}
			length={80}
			color="#88ccff"
			attenuation={(t) => t}
		>
			{/* biome-ignore lint: noStaticElementInteractions - Three.js mesh is not a DOM element*/}
			<mesh
				ref={ref}
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
