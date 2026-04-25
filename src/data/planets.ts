import * as THREE from "three";
import jupiterTexture from "@/assets/2k_jupiter.avif";
import marsTexture from "@/assets/2k_mars.avif";
import mercuryTexture from "@/assets/2k_mercury.avif";
import neptuneTexture from "@/assets/2k_neptune.avif";
import saturnTexture from "@/assets/2k_saturn.avif";
import sunTexture from "@/assets/2k_sun.avif";
import uranusTexture from "@/assets/2k_uranus.avif";
import venusTexture from "@/assets/2k_venus_atmosphere.avif";
import earthTexture from "@/assets/earth_atmos_2048.avif";
import type { Planet } from "@/types/planet";

export const testPlanet: Planet = {
	id: "test-planet",
	name: "TestPlanet",
	texturePath: earthTexture,
	rotationSpeedY: 2,
	radius: 2,
	width: 64,
	height: 64,
	position: new THREE.Vector3(100, 0, 0),
	velocity: new THREE.Vector3(-10, 0, 0),
	mass: 1,
};

export const sun: Planet = {
	id: "sun",
	name: "Sun",
	texturePath: sunTexture,
	rotationSpeedY: 0.1,
	radius: 30,
	width: 64,
	height: 64,
	position: new THREE.Vector3(0, 0, 0),
	velocity: new THREE.Vector3(0, 0, 0),
	mass: 333000,
};

export const mercury: Planet = {
	id: "mercury",
	name: "Mercury",
	texturePath: mercuryTexture,
	rotationSpeedY: 2,
	radius: 0.76, // 0.38 × 2
	width: 64,
	height: 64,
	position: new THREE.Vector3(0, 0, 0),
	velocity: new THREE.Vector3(0, 0, 0),
	mass: 0.055,
};

export const venus: Planet = {
	id: "venus",
	name: "Venus",
	texturePath: venusTexture,
	rotationSpeedY: 1.8,
	radius: 1.8,
	width: 64,
	height: 64,
	position: new THREE.Vector3(0, 0, 0),
	velocity: new THREE.Vector3(0, 0, 0),
	mass: 0.815,
};

export const earth: Planet = {
	id: "initial-earth",
	name: "Earth",
	texturePath: earthTexture,
	rotationSpeedY: 2,
	radius: 2,
	width: 64,
	height: 64,
	position: new THREE.Vector3(0, 0, 0),
	velocity: new THREE.Vector3(0, 0, 0),
	mass: 1,
};

export const mars: Planet = {
	id: "mars",
	name: "Mars",
	texturePath: marsTexture,
	rotationSpeedY: 1.5,
	radius: 1,
	width: 64,
	height: 64,
	position: new THREE.Vector3(0, 0, 0),
	velocity: new THREE.Vector3(0, 0, 0),
	mass: 0.107,
};

export const jupiter: Planet = {
	id: "jupiter",
	name: "Jupiter",
	texturePath: jupiterTexture,
	rotationSpeedY: 1.2,
	radius: 22,
	width: 64,
	height: 64,
	position: new THREE.Vector3(0, 0, 0),
	velocity: new THREE.Vector3(0, 0, 0),
	mass: 318,
};

export const saturn: Planet = {
	id: "saturn",
	name: "Saturn",
	texturePath: saturnTexture,
	rotationSpeedY: 2,
	radius: 18.2, // 9.45 × 2
	width: 64,
	height: 64,
	position: new THREE.Vector3(0, 0, 0),
	velocity: new THREE.Vector3(0, 0, 0),
	mass: 95,
};

export const uranus: Planet = {
	id: "uranus",
	name: "Uranus",
	texturePath: uranusTexture,
	rotationSpeedY: 2,
	radius: 8.0, // 4.0 × 2
	width: 64,
	height: 64,
	position: new THREE.Vector3(0, 0, 0),
	velocity: new THREE.Vector3(0, 0, 0),
	mass: 14.5,
};

export const neptune: Planet = {
	id: "neptune",
	name: "Neptune",
	texturePath: neptuneTexture,
	rotationSpeedY: 2,
	radius: 7.8, // 3.9 × 2
	width: 64,
	height: 64,
	position: new THREE.Vector3(0, 0, 0),
	velocity: new THREE.Vector3(0, 0, 0),
	mass: 17,
};
