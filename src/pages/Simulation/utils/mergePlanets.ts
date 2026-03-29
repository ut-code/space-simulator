import * as THREE from "three";
import moonTexture from "@/assets/960px-Moon_texture.avif";
import type { Planet } from "@/types/planet";

export function mergePlanets(
	massA: number,
	radA: number,
	posA: THREE.Vector3,
	velA: THREE.Vector3,
	yrotA: number,
	massB: number,
	radB: number,
	posB: THREE.Vector3,
	velB: THREE.Vector3,
	yrotB: number,
): Planet {
	const newId = crypto.randomUUID();
	const newName = "mergedPlanet";
	const newTexturePath = moonTexture;

	const newRotationSpeedY =
		(massA * radA ** 2 * yrotA + massB * radB ** 2 * yrotB) /
		(massA * radA ** 2 + massB * radB ** 2);

	const newRadius = (radA ** 3 + radB ** 3) ** (1 / 3);
	const newWidth = 64;
	const newHeight = 64;
	const newMass = massA + massB;

	const newPosition = new THREE.Vector3()
		.addVectors(
			posA.clone().multiplyScalar(massA),
			posB.clone().multiplyScalar(massB),
		)
		.divideScalar(newMass);

	const newVelocity = new THREE.Vector3()
		.addVectors(
			velA.clone().multiplyScalar(massA),
			velB.clone().multiplyScalar(massB),
		)
		.divideScalar(newMass);

	return {
		id: newId,
		name: newName,
		texturePath: newTexturePath,
		rotationSpeedY: newRotationSpeedY,
		radius: newRadius,
		width: newWidth,
		height: newHeight,
		position: newPosition,
		velocity: newVelocity,
		mass: newMass,
	};
}
