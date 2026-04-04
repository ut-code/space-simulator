import * as THREE from "three";

export const G = 1;
const softeningFactor = 0.005;

export function calcGravityForce(
	targetPos: THREE.Vector3,
	targetMass: number,
	targetRadius: number,
	sourcePos: THREE.Vector3,
	sourceMass: number,
	sourceRadius: number,
): THREE.Vector3 {
	const EPS = ((targetRadius + sourceRadius) / 2) * softeningFactor;

	const direction = new THREE.Vector3().subVectors(sourcePos, targetPos);
	// ゼロ除算を避ける
	const distanceSq = direction.lengthSq() + EPS ** 2;
	const distance = Math.sqrt(distanceSq);

	const forceScalar = (G * targetMass * sourceMass) / (distanceSq * distance);
	return direction.multiplyScalar(forceScalar);
}
