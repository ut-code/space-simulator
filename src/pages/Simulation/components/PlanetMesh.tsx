import { useSphere } from "@react-three/cannon";
import { Trail, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type React from "react";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Planet } from "@/types/planet";
import {
	CollisionType,
	decideCollisionOutcome,
} from "../utils/decideCollisionOutcome";
import { calcGravityForce } from "../utils/gravityUtils";
import { mergePlanets } from "../utils/mergePlanets";

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
	mergingPlanets: React.MutableRefObject<Set<string>>;
	onExplosion: (position: THREE.Vector3, radius: number) => void;
	onSelect: (planetId: string) => void;
	onMerge: (
		obsoletePlanetIdA: string,
		obsoletePlanetIdB: string,
		newPlanetData: Planet,
	) => void;
};

export function PlanetMesh({
	planet,
	planetRegistry,
	mergingPlanets,
	onExplosion,
	onSelect,
	onMerge,
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
				const myId = e.target.userData.id;
				const otherId = e.body.userData.id;

				// どちらかが合体処理中なら即リターン
				if (
					mergingPlanets.current.has(myId) ||
					mergingPlanets.current.has(otherId)
				) {
					return;
				}

				// 相手のIDが取得できない、または自分のIDの方が大きい場合は処理をスキップして重複を防ぐ
				if (!otherId || myId > otherId) {
					return;
				}

				if (
					!planetRegistry.current.has(myId) ||
					!planetRegistry.current.has(otherId)
				) {
					return;
				}

				const myPlanet = planetRegistry.current.get(myId);
				const otherPlanet = planetRegistry.current.get(otherId);

				if (!myPlanet || !otherPlanet) return;
				if (!myPlanet.position || !otherPlanet.position) return;
				if (!myPlanet.velocity || !otherPlanet.velocity) return;

				const myPos = new THREE.Vector3().fromArray(myPlanet.position.current);
				const myVel = new THREE.Vector3().fromArray(myPlanet.velocity.current);
				const otherPos = new THREE.Vector3().fromArray(
					otherPlanet.position.current,
				);
				const otherVel = new THREE.Vector3().fromArray(
					otherPlanet.velocity.current,
				);

				const result: string = decideCollisionOutcome(
					myPlanet.mesh.userData.mass,
					myPlanet.mesh.userData.radius,
					myPos,
					myVel,
					otherPlanet.mesh.userData.mass,
					otherPlanet.mesh.userData.radius,
					otherPos,
					otherVel,
				);

				if (result === CollisionType.Merge) {
					console.log(CollisionType.Merge);
					const newPlanetData = mergePlanets(
						myPlanet.mesh.userData.mass,
						myPlanet.mesh.userData.radius,
						myPos,
						myVel,
						myPlanet.mesh.userData.rotationSpeedY,
						otherPlanet.mesh.userData.mass,
						otherPlanet.mesh.userData.radius,
						otherPos,
						otherVel,
						otherPlanet.mesh.userData.rotationSpeedY,
					);
					onMerge(myId, otherId, newPlanetData);
				} else {
					console.log(CollisionType.Explode);
				}

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
	useEffect(() => {
		const unsubscribe = api.position.subscribe((v) => {
			position.current = v;
		});
		return () => unsubscribe(); // アンマウント時に購読解除
	}, [api.position]);

	const velocity = useRef([
		planet.velocity.x,
		planet.velocity.y,
		planet.velocity.z,
	]);
	useEffect(() => {
		const unsubscribe = api.velocity.subscribe((v) => {
			velocity.current = v;
		});
		return () => unsubscribe(); // アンマウント時に購読解除
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
				rotationSpeedY: planet.rotationSpeedY,
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
	}, [
		planet.id,
		planetRegistry,
		planet.mass,
		planet.radius,
		planet.rotationSpeedY,
		ref,
	]);

	// 計算用ベクトルをメモリに保持しておく（毎フレームnewしないため）
	const forceAccumulator = useMemo(() => new THREE.Vector3(), []);
	const myPosVec = useMemo(() => new THREE.Vector3(), []);
	const otherPosVec = useMemo(() => new THREE.Vector3(), []);

	// This hook runs every frame (approx 60fps)
	useFrame(() => {
		if (!ref.current || !planetRegistry.current) return;

		// 誤差による自転速度の異常上昇を防ぐ
		api.angularVelocity.set(0, planet.rotationSpeedY, 0);

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
