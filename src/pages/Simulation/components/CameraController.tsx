import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import type { OrbitControls } from "three-stdlib";
import { CameraFollowController } from "../core/CameraFollowController";
import type { PlanetRegistry } from "../core/PlanetRegistry";

type CameraControllerProps = {
	followedPlanetId: string | null;
	planetRegistry: PlanetRegistry;
	orbitControlsRef: React.MutableRefObject<OrbitControls | null>;
};

export function CameraController({
	followedPlanetId,
	planetRegistry,
	orbitControlsRef,
}: CameraControllerProps) {
	const { camera } = useThree();
	const followController = useMemo(() => new CameraFollowController(), []);

	useEffect(() => {
		return () => followController.reset();
	}, [followController]);

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
