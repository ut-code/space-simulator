import * as THREE from "three";
import jupiterTexture from "@/assets/2k_jupiter.avif";
import venusTexture from "@/assets/2k_venus_atmosphere.avif";
import earthTexture from "@/assets/earth_atmos_2048.avif";
import { G } from "@/pages/Play/core/GravitySystem";
import type { Planet } from "@/types/planet";
import type { Template } from "@/types/templates";

function createOrbitalSpeed(
	distance: number,
	centralMass: number,
	g = 1,
): number {
	return Math.sqrt((g * centralMass) / distance);
}

function createBinaryStarVelocities(
	separation: number,
	massA: number,
	massB: number,
	g = 1,
): { velocityA: number; velocityB: number } {
	const totalMass = massA + massB;
	const radiusA = (separation * massB) / totalMass;
	const radiusB = (separation * massA) / totalMass;
	const angularVelocity = Math.sqrt((g * totalMass) / separation ** 3);

	return {
		velocityA: angularVelocity * radiusA,
		velocityB: angularVelocity * radiusB,
	};
}

const STAR_SEPARATION = 60;

const starA: Planet = {
	id: "binary-star-a",
	name: "ヘリオスA",
	kind: "gas",
	texturePath: jupiterTexture,
	rotationSpeedY: 0.15,
	radius: 8,
	width: 64,
	height: 64,
	position: new THREE.Vector3(-STAR_SEPARATION / 2, 0, 0),
	velocity: new THREE.Vector3(0, 0, 0),
	mass: 10000,
};

const starB: Planet = {
	id: "binary-star-b",
	name: "ヘリオスB",
	kind: "gas",
	texturePath: jupiterTexture,
	rotationSpeedY: 0.12,
	radius: 7,
	width: 64,
	height: 64,
	position: new THREE.Vector3(STAR_SEPARATION / 2, 0, 0),
	velocity: new THREE.Vector3(0, 0, 0),
	mass: 10000,
};

const binaryVelocities = createBinaryStarVelocities(
	STAR_SEPARATION,
	starA.mass,
	starB.mass,
	G,
);

starA.velocity.set(0, 0, binaryVelocities.velocityA);
starB.velocity.set(0, 0, -binaryVelocities.velocityB);

const planetAroundA: Planet = {
	id: "binary-a-prime",
	name: "ヘリオスA系惑星",
	kind: "rocky",
	texturePath: venusTexture,
	rotationSpeedY: 2,
	radius: 2.2,
	width: 64,
	height: 64,
	position: new THREE.Vector3(starA.position.x - 40, 0, 0),
	velocity: new THREE.Vector3(
		0,
		0,
		starA.velocity.z + createOrbitalSpeed(40, starA.mass, G),
	),
	mass: 1.2,
};

const planetAroundB: Planet = {
	id: "binary-b-prime",
	name: "ヘリオスB系惑星",
	kind: "rocky",
	texturePath: earthTexture,
	rotationSpeedY: 2,
	radius: 2,
	width: 64,
	height: 64,
	position: new THREE.Vector3(starB.position.x + 55, 0, 0),
	velocity: new THREE.Vector3(
		0,
		0,
		starB.velocity.z - createOrbitalSpeed(55, starB.mass, G),
	),
	mass: 1,
};

export const binarySystemTemplate: Template = {
	planets: [starA, starB, planetAroundA, planetAroundB],
	cameraLocation: [0, 120, 260],
};
