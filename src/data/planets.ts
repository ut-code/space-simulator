import * as THREE from "three";
import jupiterTexture from "@/assets/2k_jupiter.jpg";
import marsTexture from "@/assets/2k_mars.jpg";
import sunTexture from "@/assets/2k_sun.jpg";
import venusTexture from "@/assets/2k_venus_atmosphere.jpg";
import moonTexture from "@/assets/960px-Moon_texture.jpg";
import earthTexture from "@/assets/earth_atmos_2048.jpg";
import type { Planet } from "@/types/planet";

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

export const moon: Planet = {
	id: "moon",
	name: "Moon",
	texturePath: moonTexture,
	rotationSpeedY: 0.07,
	radius: 0.546,
	width: 64,
	height: 64,
	position: new THREE.Vector3(100, 0, 0),
	velocity: new THREE.Vector3(-10, 0, 0),
	mass: 0.0123,
};

export const sun: Planet = {
	id: "sun",
	name: "Sun",
	texturePath: sunTexture,
	rotationSpeedY: 0.1,
	radius: 10,
	width: 64,
	height: 64,
	position: new THREE.Vector3(0, 0, 0),
	velocity: new THREE.Vector3(0, 0, 0),
	mass: 333000,
};

export const mars: Planet = {
	id: "mars",
	name: "Mars",
	texturePath: marsTexture,
	rotationSpeedY: 1.5,
	radius: 1.5,
	width: 64,
	height: 64,
	position: new THREE.Vector3(45, 0, 0),
	velocity: new THREE.Vector3(0, 0, 1.6),
	mass: 0.107,
};

export const jupiter: Planet = {
	id: "jupiter",
	name: "Jupiter",
	texturePath: jupiterTexture,
	rotationSpeedY: 1.2,
	radius: 5,
	width: 64,
	height: 64,
	position: new THREE.Vector3(80, 0, 0),
	velocity: new THREE.Vector3(0, 0, 1),
	mass: 318,
};

export const venus: Planet = {
	id: "venus",
	name: "Venus",
	texturePath: venusTexture,
	rotationSpeedY: 1.8,
	radius: 1.8,
	width: 64,
	height: 64,
	position: new THREE.Vector3(20, 0, 0),
	velocity: new THREE.Vector3(0, 0, 2.5),
	mass: 0.815,
};
