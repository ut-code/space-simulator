import type * as THREE from "three";
export type PositionRef = {
	current: number[];
};

export type VelocityRef = {
	current: number[];
};

export type PlanetRegistryEntry = {
	mass: number;
	radius: number;
	rotationSpeedY: number;
	position: THREE.Vector3;
	velocity: THREE.Vector3;
};

export class PlanetRegistry implements Iterable<[string, PlanetRegistryEntry]> {
	private readonly entries = new Map<string, PlanetRegistryEntry>();

	register(id: string, entry: PlanetRegistryEntry) {
		this.entries.set(id, entry);
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
