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
	position: PositionRef;
	velocity: VelocityRef;
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

	update(id: string, acceleration: number[], delta: number) {
		const entry = this.entries.get(id);
		if (!entry) return;
		entry.velocity.current;
		for (let i = 0; i < entry.velocity.current.length; i++) {
			entry.velocity.current[i] += acceleration[i] * delta;
			entry.position.current[i] += entry.velocity.current[i] * delta;
		}
	}

	[Symbol.iterator](): Iterator<[string, PlanetRegistryEntry]> {
		return this.entries[Symbol.iterator]();
	}
}
