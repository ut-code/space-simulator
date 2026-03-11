import type * as THREE from "three";

const G = 1;
const softeningFactor = 0.01;

export function calcGravityForce(
	targetPos: THREE.Vector3,
	targetMass: number,
	targetRadius: number,
	sourcePos: THREE.Vector3,
	sourceMass: number,
	sourceRadius: number,
	resultVec: THREE.Vector3,
): void {
	const EPS = ((targetRadius + sourceRadius) / 2) * softeningFactor;

	resultVec.subVectors(sourcePos, targetPos);
	const distanceSq = resultVec.lengthSq() + EPS ** 2;
	const distance = Math.sqrt(distanceSq);

	// 距離が0の場合、力は0として扱う（ゼロ除算を避ける）
	if (distance === 0) {
		resultVec.set(0, 0, 0);
		return;
	}

	const forceScalar = (G * targetMass * sourceMass) / (distanceSq * distance);
	resultVec.multiplyScalar(forceScalar);
}
