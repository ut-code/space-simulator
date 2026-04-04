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
import { G } from "@/pages/Simulation/core/GravitySystem";
import type { Planet } from "@/types/planet";

function createOrbitalSpeed(
	distance: number, // 中心からの距離
	centralMass: number,
	G = 1,
): number {
	return Math.sqrt((G * centralMass) / distance);
}
// スケール基準
const AU = 100;

const sun: Planet = {
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

const mercury: Planet = {
	id: "mercury",
	name: "Mercury",
	texturePath: mercuryTexture,
	rotationSpeedY: 2,
	radius: 0.76, // 0.38 × 2
	width: 64,
	height: 64,
	position: new THREE.Vector3(0.39 * AU, 0, 0),
	velocity: new THREE.Vector3(0, 0, createOrbitalSpeed(0.39 * AU, sun.mass, G)),
	mass: 0.055,
};

const venus: Planet = {
	id: "venus",
	name: "Venus",
	texturePath: venusTexture,
	rotationSpeedY: 2,
	radius: 1.9, // 0.95 × 2
	width: 64,
	height: 64,
	position: new THREE.Vector3(0.72 * AU, 0, 0),
	velocity: new THREE.Vector3(0, 0, createOrbitalSpeed(0.72 * AU, sun.mass, G)),
	mass: 0.815,
};

const earth: Planet = {
	id: "earth",
	name: "Earth",
	texturePath: earthTexture,
	rotationSpeedY: 2,
	radius: 2,
	width: 64,
	height: 64,
	position: new THREE.Vector3(1 * AU, 0, 0),
	velocity: new THREE.Vector3(0, 0, createOrbitalSpeed(1 * AU, sun.mass, G)),
	mass: 1,
};

const mars: Planet = {
	id: "mars",
	name: "Mars",
	texturePath: marsTexture,
	rotationSpeedY: 2,
	radius: 1.06, // 0.53 × 2
	width: 64,
	height: 64,
	position: new THREE.Vector3(1.52 * AU, 0, 0),
	velocity: new THREE.Vector3(0, 0, createOrbitalSpeed(1.52 * AU, sun.mass, G)),
	mass: 0.107,
};

const jupiter: Planet = {
	id: "jupiter",
	name: "Jupiter",
	texturePath: jupiterTexture,
	rotationSpeedY: 2,
	radius: 22.4, // 11.2 × 2
	width: 64,
	height: 64,
	position: new THREE.Vector3(5.2 * AU, 0, 0),
	velocity: new THREE.Vector3(0, 0, createOrbitalSpeed(5.2 * AU, sun.mass, G)),
	mass: 318,
};

const saturn: Planet = {
	id: "saturn",
	name: "Saturn",
	texturePath: saturnTexture,
	rotationSpeedY: 2,
	radius: 18.9, // 9.45 × 2
	width: 64,
	height: 64,
	position: new THREE.Vector3(9.58 * AU, 0, 0),
	velocity: new THREE.Vector3(0, 0, createOrbitalSpeed(9.58 * AU, sun.mass, G)),
	mass: 95,
};

const uranus: Planet = {
	id: "uranus",
	name: "Uranus",
	texturePath: uranusTexture,
	rotationSpeedY: 2,
	radius: 8.0, // 4.0 × 2
	width: 64,
	height: 64,
	position: new THREE.Vector3(19.2 * AU, 0, 0),
	velocity: new THREE.Vector3(0, 0, createOrbitalSpeed(19.2 * AU, sun.mass, G)),
	mass: 14.5,
};

const neptune: Planet = {
	id: "neptune",
	name: "Neptune",
	texturePath: neptuneTexture,
	rotationSpeedY: 2,
	radius: 7.8, // 3.9 × 2
	width: 64,
	height: 64,
	position: new THREE.Vector3(30.1 * AU, 0, 0),
	velocity: new THREE.Vector3(0, 0, createOrbitalSpeed(30.1 * AU, sun.mass, G)),
	mass: 17,
};

export const solarPlanets: Planet[] = [
	sun,
	mercury,
	venus,
	earth,
	mars,
	jupiter,
	saturn,
	uranus,
	neptune,
];
