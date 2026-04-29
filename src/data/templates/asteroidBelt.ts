import * as THREE from "three";
import jupiterTexture from "@/assets/2k_jupiter.avif";
import mercuryTexture from "@/assets/2k_mercury.avif";
import sunTexture from "@/assets/2k_sun.avif";
import { G } from "@/pages/Play/core/GravitySystem";
import type { Planet } from "@/types/planet";
import type { Template } from "@/types/templates";

function createOrbitalSpeed(
	distance: number,
	centralMass: number,
	g = 1,
): number {
	if (distance <= 0 || centralMass <= 0 || !Number.isFinite(g)) {
		console.warn(
			`createOrbitalSpeed: invalid input (distance=${distance}, mass=${centralMass}, g=${g})`,
		);
		return 0;
	}
	return Math.sqrt((g * centralMass) / distance);
}

function createAsteroid(index: number, sunMass: number): Planet {
	const angleStep = (index / 100) * Math.PI * 2;
	const radialVariation = Math.sin(index * 0.314) * 8;
	const distance = 230 + (index % 20) * 2.5 + radialVariation;
	const radius = 0.32 + ((index * 13) % 8) * 0.05;
	const orbitSpeed = createOrbitalSpeed(distance, sunMass, G);

	const x = Math.cos(angleStep) * distance;
	const z = Math.sin(angleStep) * distance;
	const tangentialX = -Math.sin(angleStep) * orbitSpeed;
	const tangentialZ = Math.cos(angleStep) * orbitSpeed;

	return {
		id: `asteroid-${index}`,
		name: `小惑星 ${index + 1}`,
		kind: "rocky",
		texturePath: mercuryTexture,
		rotationSpeedY: 0.6 + (index % 6) * 0.15,
		radius,
		width: 32,
		height: 32,
		position: new THREE.Vector3(x, 0, z),
		velocity: new THREE.Vector3(tangentialX, 0, tangentialZ),
		mass: radius * 0.01,
	};
}

const sun: Planet = {
	id: "belt-sun",
	name: "太陽",
	kind: "star",
	texturePath: sunTexture,
	rotationSpeedY: 0.1,
	radius: 9,
	width: 64,
	height: 64,
	position: new THREE.Vector3(0, 0, 0),
	velocity: new THREE.Vector3(0, 0, 0),
	mass: 220000,
};

const innerGiant: Planet = {
	id: "belt-inner-giant",
	name: "アスター",
	kind: "gas",
	texturePath: jupiterTexture,
	rotationSpeedY: 1.3,
	radius: 5.5,
	width: 64,
	height: 64,
	position: new THREE.Vector3(170, 0, 0),
	velocity: new THREE.Vector3(0, 0, createOrbitalSpeed(170, sun.mass, G)),
	mass: 220,
};

const asteroids = Array.from({ length: 100 }, (_, index) =>
	createAsteroid(index, sun.mass),
);

export const asteroidBeltTemplate: Template = {
	planets: [sun, innerGiant, ...asteroids],
	cameraLocation: [0, 160, 430],
};
