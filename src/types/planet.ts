import type * as THREE from "three";
export type Planet = {
	texturePath: string;
	rotationSpeedY: number;
	radius: number;
	width: number;
	height: number;
	position: THREE.Vector3;
};
