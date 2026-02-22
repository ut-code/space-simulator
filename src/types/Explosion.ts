import type * as THREE from "three";
export type ExplosionData = {
	id: string;
	radius: number;
	position: THREE.Vector3;
	fragmentCount: number;
};
