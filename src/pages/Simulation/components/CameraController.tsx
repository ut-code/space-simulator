import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as Controls } from "three-stdlib";

// 惑星レジストリのエントリの型を定義
type PlanetRegistryEntry = {
	mesh: THREE.Mesh;
	position: React.MutableRefObject<number[]>;
};

type CameraControllerProps = {
	followedPlanetId: string | null;
	planetRegistry: React.MutableRefObject<Map<string, PlanetRegistryEntry>>;
	orbitControlsRef: React.MutableRefObject<Controls | null>;
};

export function CameraController({
	followedPlanetId,
	planetRegistry,
	orbitControlsRef,
}: CameraControllerProps) {
	const { camera } = useThree();
	// useMemo を使ってベクターを初期化し、毎フレームのインスタンス生成を避ける
	const previousPos = useMemo(() => new THREE.Vector3(), []);
	const currentPos = useMemo(() => new THREE.Vector3(), []);
	const delta = useMemo(() => new THREE.Vector3(), []);
	const hasPrev = useRef(false);
	// 前回のフレームで追尾していた惑星IDを保持する
	const prevFollowedPlanetId = useRef<string | null>(null);

	useFrame(() => {
		// 追尾対象が変更されたかチェック
		if (prevFollowedPlanetId.current !== followedPlanetId) {
			// 変更された場合、カメラ移動の差分計算をリセット
			hasPrev.current = false;
			prevFollowedPlanetId.current = followedPlanetId;
		}

		const controls = orbitControlsRef.current;
		if (!controls) return;

		// 追尾対象がなければ何もしない
		if (!followedPlanetId) return;

		// 毎フレーム、レジストリから最新の追尾対象を取得
		const target = planetRegistry.current.get(followedPlanetId);
		if (!target) return;

		// number[] を Vector3 にセット (fromArray を使用してより簡潔に)
		currentPos.fromArray(target.position.current);

		if (hasPrev.current) {
			delta.copy(currentPos).sub(previousPos);
			camera.position.add(delta);
		}

		// OrbitControlsのターゲット更新
		controls.target.copy(currentPos);
		controls.update();

		// 前回位置更新
		previousPos.copy(currentPos);
		hasPrev.current = true;
	});
	return null;
}
