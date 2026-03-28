import { useFrame, useThree } from "@react-three/fiber";
import { useEffect } from "react";
import type { OrbitControls } from "three-stdlib";
import { CameraFollowController } from "../core/CameraFollowController";
import type { PlanetRegistry } from "../core/PlanetRegistry";

type CameraControllerProps = {
	followedPlanetId: string | null;
	planetRegistry: PlanetRegistry;
	orbitControlsRef: React.MutableRefObject<OrbitControls | null>;
};

// Reactのライフサイクル外でシングルトンとして管理する
const followController = new CameraFollowController();

export function CameraController({
	followedPlanetId,
	planetRegistry,
	orbitControlsRef,
}: CameraControllerProps) {
	const { camera } = useThree();

	useEffect(() => {
		return () => followController.reset();
	}, []);

	useFrame(() => {
		followController.update({
			followedPlanetId,
			planetRegistry,
			camera,
			controls: orbitControlsRef.current,
		});
	});
	return null;
}
