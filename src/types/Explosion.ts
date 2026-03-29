import type * as THREE from "three";

// kind distinguishes visual style: "explosion" = rocky debris burst, "spark" = small orange sparks
export type ExplosionData = {
	id: string;
	radius: number;
	position: THREE.Vector3;
	fragmentCount: number;
	kind?: "explosion" | "spark";
};
