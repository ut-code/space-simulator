import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";

type PreviewPlanetProps = {
	radius: number;
	position: [number, number, number];
};
// 惑星の配置プレビュー用の半透明の球体を描画するコンポーネント
export function PreviewPlanet({ radius, position }: PreviewPlanetProps) {
	return (
		<mesh position={position}>
			<sphereGeometry args={[radius, 24, 24]} />
			<meshBasicMaterial color="#6ee7ff" wireframe opacity={0.6} transparent />
		</mesh>
	);
}

type PlacementSurfaceProps = {
	enabled: boolean;
	yLevel: number;
	onPlace: (position: [number, number, number]) => void;
};
// 惑星の配置を行うための透明な平面を描画するコンポーネント
export function PlacementSurface({
	enabled,
	yLevel,
	onPlace,
}: PlacementSurfaceProps) {
	const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
		if (!enabled) {
			return;
		}

		event.stopPropagation();
		const { x, y, z } = event.point;
		const step = 0.2;
		const round = (value: number) => Math.round(value / step) * step;
		onPlace([round(x), round(y), round(z)]);
	};

	return (
		<mesh
			position={[0, yLevel, 0]}
			rotation={[-Math.PI / 2, 0, 0]}
			onPointerDown={handlePointerDown}
		>
			<planeGeometry args={[400, 400]} />
			<meshBasicMaterial
				color="#6ee7ff"
				opacity={enabled ? 0.14 : 0}
				transparent
				depthWrite={false}
				side={THREE.DoubleSide}
			/>
		</mesh>
	);
}
