import * as THREE from "three";
import type { OrbitControls } from "three-stdlib";
import type { PlanetRegistry } from "./PlanetRegistry";

type CameraFollowUpdateParams = {
	followedPlanetId: string | null;
	planetRegistry: PlanetRegistry;
	camera: THREE.Camera;
	controls: OrbitControls | null;
};

export class CameraFollowController {
	private readonly previousPos = new THREE.Vector3();
	private readonly currentPos = new THREE.Vector3();
	private readonly delta = new THREE.Vector3();
	private hasPrev = false;
	private prevFollowedPlanetId: string | null = null;

	update({
		followedPlanetId,
		planetRegistry,
		camera,
		controls,
	}: CameraFollowUpdateParams) {
		if (this.prevFollowedPlanetId !== followedPlanetId) {
			this.hasPrev = false;
			this.prevFollowedPlanetId = followedPlanetId;
		}

		if (!controls || !followedPlanetId) return;

		const target = planetRegistry.get(followedPlanetId);
		if (!target) return;

		this.currentPos.copy(target.position);

		if (this.hasPrev) {
			this.delta.copy(this.currentPos).sub(this.previousPos);
			camera.position.add(this.delta);
		}

		controls.target.copy(this.currentPos);
		controls.update();

		this.previousPos.copy(this.currentPos);
		this.hasPrev = true;
	}

	reset() {
		this.hasPrev = false;
		this.prevFollowedPlanetId = null;
	}
}
