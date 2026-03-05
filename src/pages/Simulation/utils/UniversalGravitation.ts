import * as THREE from "three";

const G = 1;

export function calc_gravity_force(
	targetPos: THREE.Vector3,
	targetMass: number,
	targetRadius: number,
	sourcePos: THREE.Vector3,
	sourceMass: number,
	sourceRadius: number,
): THREE.Vector3 {
	const direction = new THREE.Vector3().subVectors(sourcePos, targetPos);
	const distanceSq = direction.lengthSq();
	const distance = Math.sqrt(distanceSq);

	// 2つの惑星が接触または重なっている場合は、引力を0にする
	const minDistance = targetRadius + sourceRadius;
	if (distance < minDistance) {
		return new THREE.Vector3(0, 0, 0);
	}

	const forceScalar = (G * targetMass * sourceMass) / (distanceSq * distance);
	return direction.multiplyScalar(forceScalar);
}
