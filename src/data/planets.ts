import * as THREE from "three";
import type { Planet } from "@/types/planet";

export const earth: Planet = {
	id: "initial-earth",
	name: "Earth",
	texturePath:
		"https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg",
	rotationSpeedY: 2,
	radius: 2,
	width: 64,
	height: 64,
	position: new THREE.Vector3(0, 0, 0),
	velocity: new THREE.Vector3(0, 0, 0),
};

export const testPlanet: Planet = {
	id: "test-planet",
	name: "TestPlanet",
	texturePath:
		"https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg",
	rotationSpeedY: 2,
	radius: 2,
	width: 64,
	height: 64,
	position: new THREE.Vector3(100, 0, 0),
	velocity: new THREE.Vector3(-10, 0, 0),
};

// Easy to add more planets later:
// export const mars: Planet = { ... };
// export const jupiter: Planet = { ... };
