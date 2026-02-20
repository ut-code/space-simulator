import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { Planet } from "@/types/planet";

type Fragment = {
	mesh: THREE.Mesh;
	velocity: THREE.Vector3;
	rotationAxis: THREE.Vector3;
	lifetime: number;
};

type ExplosionProps = {
	planet: Planet;
	fragmentCount?: number;
	onComplete?: () => void;
};

export const Explosion: React.FC<ExplosionProps> = ({
	planet,
	fragmentCount = 50,
	onComplete,
}: ExplosionProps) => {
	const groupRef = useRef<THREE.Group>(null);
	const [fragments, setFragments] = useState<Fragment[]>([]);

	// 爆発初期化
	useEffect(() => {
		const newFragments: Fragment[] = [];
		for (let i = 0; i < fragmentCount; i++) {
			const size = Math.random() * (planet.radius * 0.2) + 0.05;
			const geometry = new THREE.SphereGeometry(size, 6, 6);
			const material = new THREE.MeshStandardMaterial({
				color: 0xffaa33,
				emissive: 0xff5500,
			});
			const mesh = new THREE.Mesh(geometry, material);

			// 初期位置は惑星中心
			mesh.position.copy(planet.position);

			// ランダム方向に飛ぶ速度
			const velocity = new THREE.Vector3(
				(Math.random() - 0.5) * 4,
				(Math.random() - 0.5) * 4,
				(Math.random() - 0.5) * 4,
			);

			// 回転軸
			const rotationAxis = new THREE.Vector3(
				Math.random(),
				Math.random(),
				Math.random(),
			).normalize();

			newFragments.push({
				mesh,
				velocity,
				rotationAxis,
				lifetime: Math.random() * 2 + 1, // 1~3秒で消える
			});
		}
		setFragments(newFragments);
	}, [planet, fragmentCount]);

	// フレームごとの更新
	useFrame((_, delta) => {
		if (fragments.length === 0) return;

		setFragments((prev) => {
			const alive: Fragment[] = [];
			prev.forEach((f) => {
				// 位置更新
				f.mesh.position.add(f.velocity.clone().multiplyScalar(delta));

				// 回転
				f.mesh.rotateOnAxis(f.rotationAxis, delta * 5);

				// 減速（摩擦的）
				f.velocity.multiplyScalar(0.98);

				// 減衰
				f.lifetime -= delta;
				if (f.lifetime > 0) alive.push(f);
				else f.mesh.parent?.remove(f.mesh); // Group から削除
			});

			// 爆発完了通知
			if (alive.length === 0 && onComplete) onComplete();

			return alive;
		});
	});

	return (
		<group ref={groupRef}>
			{fragments.map((f, i) => (
				<primitive key={i} object={f.mesh} />
			))}
		</group>
	);
};
