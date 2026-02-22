import type * as THREE from "three";
export type Planet = {
	name: string;
	texturePath: string;
	rotationSpeedY: number;
	radius: number;
	width: number;
	height: number;
	position: THREE.Vector3;
	velocity: THREE.Vector3;
};
