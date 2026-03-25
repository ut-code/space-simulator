import type * as THREE from "three";
import type { Planet } from "@/types/planet";

export type PlanetRegistryEntry = {
	mass: number;
	radius: number;
	rotationSpeedY: number;
	texturePath: string;
	width: number;
	height: number;
	name: string;
	position: THREE.Vector3;
	velocity: THREE.Vector3;
};

export class PlanetRegistry implements Iterable<[string, PlanetRegistryEntry]> {
	private readonly entries = new Map<string, PlanetRegistryEntry>();

	register(id: string, planet: Planet) {
		this.entries.set(id, {
			mass: planet.mass,
			radius: planet.radius,
			rotationSpeedY: planet.rotationSpeedY,
			texturePath: planet.texturePath,
			width: planet.width,
			height: planet.height,
			name: planet.name,
			position: planet.position.clone(),
			velocity: planet.velocity.clone(),
		});
	}

	unregister(id: string) {
		this.entries.delete(id);
	}

	get(id: string) {
		return this.entries.get(id);
	}

	has(id: string) {
		return this.entries.has(id);
	}

	clear() {
		this.entries.clear();
	}

	get size() {
		return this.entries.size;
	}

	update(id: string, acceleration: THREE.Vector3, delta: number) {
		const entry = this.entries.get(id);
		if (!entry) return;
		entry.velocity.addScaledVector(acceleration, delta);
		entry.position.addScaledVector(entry.velocity, delta);
	}

	[Symbol.iterator](): Iterator<[string, PlanetRegistryEntry]> {
		return this.entries[Symbol.iterator]();
	}
}
