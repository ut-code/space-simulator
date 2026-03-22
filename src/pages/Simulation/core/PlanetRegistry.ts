import type * as THREE from "three";

export type PositionRef = {
	current: number[];
};

export type PlanetRegistryEntry = {
	mesh: THREE.Mesh;
	position: PositionRef;
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

	[Symbol.iterator](): Iterator<[string, PlanetRegistryEntry]> {
		return this.entries[Symbol.iterator]();
	}
}
