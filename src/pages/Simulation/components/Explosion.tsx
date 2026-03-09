import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { ExplosionData } from "@/types/Explosion";

type Fragment = {
	id: string;
	mesh: THREE.Mesh;
	velocity: THREE.Vector3;
	rotationAxis: THREE.Vector3;
	lifetime: number;
};

type ExplosionProps = {
	explosion: ExplosionData;
	onComplete?: () => void;
	timeScale: number;
};

export function Explosion({
	explosion,
	onComplete,
	timeScale,
}: ExplosionProps) {
	const groupRef = useRef<THREE.Group | null>(null);
	const [fragments, setFragments] = useState<Fragment[]>([]);

	// 爆発初期化
	useEffect(() => {
		const newFragments: Fragment[] = [];
		for (let i = 0; i < explosion.fragmentCount; i++) {
			const id = crypto.randomUUID();

			const size = Math.random() * (explosion.radius * 0.2) + 0.05;
			const geometry = new THREE.SphereGeometry(size, 6, 6);
			const material = new THREE.MeshStandardMaterial({
				color: 0xffaa33,
				emissive: 0xff5500,
			});
			const mesh = new THREE.Mesh(geometry, material);

			// 初期位置は惑星中心
			mesh.position.copy(explosion.position);

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
				id,
				mesh,
				velocity,
				rotationAxis,
				lifetime: Math.random() * 2 + 1, // 1~3秒で消える
			});
		}
		setFragments(newFragments);

		return () => {
			for (let i = 0; i < newFragments.length; i++) {
				const f = newFragments[i];
				f.mesh.parent?.remove(f.mesh);
				f.mesh.geometry.dispose();

				const mat = f.mesh.material;
				if (Array.isArray(mat)) {
					for (let j = 0; j < mat.length; j++) {
						mat[j].dispose();
					}
				} else {
					mat.dispose();
				}
			}
		};
	}, [explosion]);

	// フレームごとの更新
	useFrame((_, delta) => {
		if (fragments.length === 0) return;
		const scaledDelta = delta * timeScale;
		const damping = 0.98 ** timeScale;

		setFragments((prev) => {
			const alive: Fragment[] = [];

			for (let i = 0; i < prev.length; i++) {
				const f = prev[i];

				// 位置更新
				f.mesh.position.addScaledVector(f.velocity, scaledDelta);

				// 回転
				f.mesh.rotateOnAxis(f.rotationAxis, scaledDelta * 5);

				// 減速（摩擦的）
				f.velocity.multiplyScalar(damping);

				// 減衰
				f.lifetime -= scaledDelta;

				if (f.lifetime > 0) {
					alive.push(f);
				} else {
					f.mesh.parent?.remove(f.mesh); // Group から削除
				}
			}

			// 爆発完了通知
			if (alive.length === 0 && onComplete) {
				onComplete();
			}

			return alive;
		});
	});

	return (
		<group ref={groupRef}>
			{fragments.map((f) => (
				<primitive key={f.id} object={f.mesh} />
			))}
		</group>
	);
}
