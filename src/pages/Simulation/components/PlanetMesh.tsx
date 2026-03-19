import { useSphere } from "@react-three/cannon";
import { Trail, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type React from "react";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Planet } from "@/types/planet";
import { calcGravityForce } from "../utils/gravityUtils";

type PlanetMeshProps = {
	planet: Planet;
	planetRegistry: React.MutableRefObject<
		Map<
			string,
			{
				mesh: THREE.Mesh;
				position: React.MutableRefObject<number[]>;
				velocity: React.MutableRefObject<number[]>;
			}
		>
	>;
	onExplosion: (position: THREE.Vector3, radius: number) => void;
	onSelect: (planetId: string) => void;
	timeScale: number;
};

export function PlanetMesh({
	planet,
	planetRegistry,
	onExplosion,
	onSelect,
	timeScale,
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

	// 物理エンジンの位置を追跡するためのref
	const position = useRef([
		planet.position.x,
		planet.position.y,
		planet.position.z,
	]);
	const velocity = useRef([
		planet.velocity.x,
		planet.velocity.y,
		planet.velocity.z,
	]);
	useEffect(() => {
		const unsubscribe = api.position.subscribe((v) => {
			position.current = v;
		});
		return () => unsubscribe(); // アンマウント時に購読解除
	}, [api.position]);
	useEffect(() => {
		const unsubscribe = api.velocity.subscribe((v) => {
			velocity.current = v;
		});
		return () => unsubscribe();
	}, [api.velocity]);

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
			planetRegistry.current.set(planet.id, {
				mesh: ref.current,
				position,
				velocity,
			});
		}
		return () => {
			if (planetRegistry.current) {
				planetRegistry.current.delete(planet.id);
			}
		};
	}, [planet.id, planetRegistry, planet.mass, planet.radius, ref]);

	// 計算用ベクトルをメモリに保持しておく（毎フレームnewしないため）
	const forceAccumulator = useMemo(() => new THREE.Vector3(), []);
	const myPosVec = useMemo(() => new THREE.Vector3(), []);
	const otherPosVec = useMemo(() => new THREE.Vector3(), []);

	// This hook runs every frame (approx 60fps)
	useFrame(() => {
		if (!ref.current || !planetRegistry.current) return;

		// 誤差による自転速度の異常上昇を防ぐ
		api.angularVelocity.set(0, planet.rotationSpeedY * timeScale, 0);

		// ref.current.positionの代わりに、物理エンジンから取得した位置を使用
		myPosVec.fromArray(position.current);
		forceAccumulator.set(0, 0, 0); // 毎フレームリセットして使い回す

		// 他のすべての惑星からの引力を計算して合算
		for (const [otherId, other] of planetRegistry.current) {
			if (otherId === planet.id) continue;

			const { mesh: otherMesh, position: otherPosition } = other;
			otherPosVec.fromArray(otherPosition.current);
			const otherMass = otherMesh.userData.mass || 1;
			const otherRadius = otherMesh.userData.radius || 0.1;

			const force = calcGravityForce(
				myPosVec,
				planet.mass,
				planet.radius,
				otherPosVec,
				otherMass,
				otherRadius,
			);
			forceAccumulator.add(force);
		}

		// 計算した力を重心に適用
		forceAccumulator.multiplyScalar(timeScale);
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
