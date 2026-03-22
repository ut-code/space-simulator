import * as THREE from "three";
import type { PlanetRegistry } from "./PlanetRegistry";

const G = 1;
const SOFTENING_FACTOR = 0.005;

type AccumulateForPlanetParams = {
	planetId: string;
	targetMass: number;
	targetRadius: number;
	targetPosition: THREE.Vector3;
	planetRegistry: PlanetRegistry;
	outForce: THREE.Vector3;
};

export class GravitySystem {
	private readonly direction = new THREE.Vector3();
	private readonly sourcePosition = new THREE.Vector3();

	accumulateForPlanet({
		planetId,
		targetMass,
		targetRadius,
		targetPosition,
		planetRegistry,
		outForce,
	}: AccumulateForPlanetParams) {
		outForce.set(0, 0, 0);

		for (const [otherId, other] of planetRegistry) {
			if (otherId === planetId) continue;

			const { mesh: otherMesh, position: otherPosition } = other;
			this.sourcePosition.fromArray(otherPosition.current);
			const sourceMass = otherMesh.userData.mass || 1;
			const sourceRadius = otherMesh.userData.radius || 0.1;

			this.addPairForce(
				outForce,
				targetPosition,
				targetMass,
				targetRadius,
				this.sourcePosition,
				sourceMass,
				sourceRadius,
			);
		}

		return outForce;
	}

	private addPairForce(
		outForce: THREE.Vector3,
		targetPos: THREE.Vector3,
		targetMass: number,
		targetRadius: number,
		sourcePos: THREE.Vector3,
		sourceMass: number,
		sourceRadius: number,
	) {
		const eps = ((targetRadius + sourceRadius) / 2) * SOFTENING_FACTOR;

		this.direction.subVectors(sourcePos, targetPos);
		const distanceSq = this.direction.lengthSq() + eps ** 2;
		const distance = Math.sqrt(distanceSq);
		const forceScalar = (G * targetMass * sourceMass) / (distanceSq * distance);

		outForce.addScaledVector(this.direction, forceScalar);
	}
}
