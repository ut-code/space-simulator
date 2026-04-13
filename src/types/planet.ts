import type * as THREE from "three";

export type PlanetKind = "star" | "rocky" | "gas";

export type Planet = {
	id: string;
	name: string;
	kind?: PlanetKind;
	texturePath: string;
	rotationSpeedY: number;
	radius: number;
	width: number;
	height: number;
	position: THREE.Vector3;
	velocity: THREE.Vector3;
	mass: number;
};
