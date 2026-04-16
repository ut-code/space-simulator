import { Line } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";

type VelocityArrowProps = {
	velocity: [number, number, number];
	radius: number;
	lineColor: string;
	headColor: string;
	emissiveColor: string;
};

function VelocityArrow({
	velocity,
	radius,
	lineColor,
	headColor,
	emissiveColor,
}: VelocityArrowProps) {
	const velocityVector = useMemo(
		() => new THREE.Vector3(velocity[0], velocity[1], velocity[2]),
		[velocity],
	);
	const speed = velocityVector.length();
	const hasVelocity = speed > 0.001;

	const direction = useMemo(() => {
		if (!hasVelocity) {
			return new THREE.Vector3(1, 0, 0);
		}
		return velocityVector.clone().normalize();
	}, [hasVelocity, velocityVector]);

	const arrowLength = useMemo(() => {
		const scaledBySpeed = speed * 1.4;
		const minLength = Math.max(radius * 1.2, 1.2);
		return Math.min(Math.max(scaledBySpeed, minLength), 30);
	}, [radius, speed]);

	const headLength = Math.max(radius * 0.55, 0.55);
	const shaftLength = Math.max(arrowLength - headLength, 0.2);

	const shaftEnd = useMemo(
		() => direction.clone().multiplyScalar(shaftLength),
		[direction, shaftLength],
	);
	const headCenter = useMemo(
		() => direction.clone().multiplyScalar(shaftLength + headLength / 2),
		[direction, headLength, shaftLength],
	);
	const headQuaternion = useMemo(() => {
		const quaternion = new THREE.Quaternion();
		quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
		return quaternion;
	}, [direction]);

	if (!hasVelocity) return null;

	return (
		<>
			<Line
				points={[
					[0, 0, 0],
					[shaftEnd.x, shaftEnd.y, shaftEnd.z],
				]}
				color={lineColor}
				lineWidth={2}
				transparent
				opacity={0.95}
			/>
			<mesh
				position={[headCenter.x, headCenter.y, headCenter.z]}
				quaternion={headQuaternion}
			>
				<coneGeometry args={[headLength * 0.28, headLength, 16]} />
				<meshStandardMaterial
					color={headColor}
					emissive={emissiveColor}
					emissiveIntensity={0.8}
					transparent
					opacity={0.95}
				/>
			</mesh>
		</>
	);
}

type PreviewPlanetProps = {
	radius: number;
	position: [number, number, number];
	velocity: [number, number, number];
};
// 惑星の配置プレビュー用の半透明の球体を描画するコンポーネント
export function PreviewPlanet({
	radius,
	position,
	velocity,
}: PreviewPlanetProps) {
	return (
		<group position={position}>
			<mesh>
				<sphereGeometry args={[radius, 24, 24]} />
				<meshBasicMaterial
					color="#6ee7ff"
					wireframe
					opacity={0.6}
					transparent
				/>
			</mesh>
			<VelocityArrow
				velocity={velocity}
				radius={radius}
				lineColor="#7bf9ff"
				headColor="#bdfcff"
				emissiveColor="#39d3ff"
			/>
		</group>
	);
}

export type StagedPreviewPlanetProps = {
	radius: number;
	position: [number, number, number];
	velocity: [number, number, number];
};

export function StagedPreviewPlanet({
	radius,
	position,
	velocity,
}: StagedPreviewPlanetProps) {
	return (
		<group position={position}>
			<mesh>
				<sphereGeometry args={[radius, 24, 24]} />
				<meshBasicMaterial
					color="#f59e0b"
					wireframe
					opacity={0.4}
					transparent
				/>
			</mesh>
			<VelocityArrow
				velocity={velocity}
				radius={radius}
				lineColor="#fbbf24"
				headColor="#fcd34d"
				emissiveColor="#d97706"
			/>
		</group>
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
			<planeGeometry args={[2000, 2000]} />
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
