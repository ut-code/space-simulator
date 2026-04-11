import * as THREE from "three";
import type { ExplosionData } from "@/types/explosion";
import type { Planet } from "@/types/planet";
import { applyAutoKindIfEnabled } from "../utils/planetKind";

type NewPlanetSettings = {
	radius: number;
	mass?: number;
	position: [number, number, number];
	velocity?: [number, number, number];
	rotationSpeedY: number;
	autoKindAssignment?: boolean;
};

export type mergeQueueProps = {
	obsoleteIdA: string;
	obsoleteIdB: string;
	newData: Planet;
};

export type SimulationWorldSnapshot = {
	planetIds: string[];
	explosions: ExplosionData[];
	mergeQueue: { id: string; data: mergeQueueProps }[];
	followedPlanetId: string | null;
};

function computeMass(radius: number, mass: number, newRadius: number) {
	// Validate inputs to prevent NaN
	if (!Number.isFinite(radius) || radius <= 0) {
		console.warn("computeMass: invalid radius", radius);
		return 1; // Fallback to unit mass
	}
	if (!Number.isFinite(mass) || mass <= 0) {
		console.warn("computeMass: invalid mass", mass);
		return 1; // Fallback to unit mass
	}
	if (!Number.isFinite(newRadius) || newRadius <= 0) {
		console.warn("computeMass: invalid newRadius", newRadius);
		return 1; // Fallback to unit mass
	}

	const computedMass = mass * (newRadius / radius) ** 3;

	// Validate output
	if (!Number.isFinite(computedMass) || computedMass <= 0) {
		console.warn(
			"computeMass: computed invalid mass",
			computedMass,
			"from inputs:",
			{ radius, mass, newRadius },
		);
		return 1; // Fallback to unit mass
	}

	return computedMass;
}

export class SimulationWorld {
	private activePlanetIds: Set<string>;
	private explosions: ExplosionData[] = [];
	private mergeQueue: { id: string; data: mergeQueueProps }[] = [];
	private followedPlanetId: string | null = null;
	private snapshot: SimulationWorldSnapshot;

	constructor(initialPlanets: Planet[]) {
		this.activePlanetIds = new Set(initialPlanets.map((planet) => planet.id));
		this.snapshot = this.buildSnapshot();
	}

	private buildSnapshot(): SimulationWorldSnapshot {
		return {
			planetIds: [...this.activePlanetIds],
			explosions: this.explosions,
			mergeQueue: this.mergeQueue,
			followedPlanetId: this.followedPlanetId,
		};
	}

	private updateSnapshot() {
		this.snapshot = this.buildSnapshot();
	}

	/**
	 * Manually update the snapshot after making changes.
	 * Call this after adding/removing planets to refresh the snapshot.
	 */
	public refreshSnapshot(): void {
		this.updateSnapshot();
	}

	getSnapshot(): SimulationWorldSnapshot {
		return this.snapshot;
	}

	clear() {
		this.activePlanetIds.clear();
		this.explosions = [];
		this.mergeQueue = [];
		this.followedPlanetId = null;
		this.updateSnapshot();
	}

	addPlanetFromTemplate(template: Planet, settings: NewPlanetSettings): Planet {
		const [posX, posY, posZ] = settings.position;
		const [velX, velY, velZ] = settings.velocity ?? [0, 0, 0];

		// Validate inputs
		if (
			!Number.isFinite(posX) ||
			!Number.isFinite(posY) ||
			!Number.isFinite(posZ)
		) {
			console.error(
				"addPlanetFromTemplate: invalid position",
				settings.position,
			);
			throw new Error("Invalid planet position");
		}
		if (
			!Number.isFinite(velX) ||
			!Number.isFinite(velY) ||
			!Number.isFinite(velZ)
		) {
			console.error(
				"addPlanetFromTemplate: invalid velocity",
				settings.velocity,
			);
			throw new Error("Invalid planet velocity");
		}
		if (!Number.isFinite(settings.radius) || settings.radius <= 0) {
			console.error("addPlanetFromTemplate: invalid radius", settings.radius);
			throw new Error("Invalid planet radius");
		}
		if (!Number.isFinite(settings.rotationSpeedY)) {
			console.error(
				"addPlanetFromTemplate: invalid rotationSpeedY",
				settings.rotationSpeedY,
			);
			throw new Error("Invalid planet rotationSpeedY");
		}
		if (
			settings.mass !== undefined &&
			(!Number.isFinite(settings.mass) || settings.mass <= 0)
		) {
			console.error("addPlanetFromTemplate: invalid mass", settings.mass);
			throw new Error("Invalid planet mass");
		}

		const mass =
			settings.mass ??
			computeMass(template.radius, template.mass, settings.radius);
		const newPlanet: Planet = {
			id: crypto.randomUUID(),
			name: template.name,
			kind: template.kind,
			texturePath: template.texturePath,
			rotationSpeedY: settings.rotationSpeedY,
			radius: settings.radius,
			width: 64,
			height: 64,
			position: new THREE.Vector3(posX, posY, posZ),
			velocity: new THREE.Vector3(velX, velY, velZ),
			mass,
		};
		const planetWithKind = applyAutoKindIfEnabled(
			newPlanet,
			settings.autoKindAssignment ?? false,
		);
		this.activePlanetIds.add(newPlanet.id);
		// Don't update snapshot here - let caller do it after registering in PlanetRegistry
		// This prevents race condition where React renders with planet ID but no registry entry
		return planetWithKind;
	}

	addPlanet(data: Planet) {
		if (this.activePlanetIds.has(data.id)) return;
		this.activePlanetIds.add(data.id);
		this.updateSnapshot();
	}

	removePlanet(planetId: string) {
		this.activePlanetIds.delete(planetId);
		if (this.followedPlanetId === planetId) {
			this.followedPlanetId = null;
		}
		this.updateSnapshot();
	}

	setFollowedPlanetId(planetId: string | null) {
		if (planetId && !this.activePlanetIds.has(planetId)) {
			this.followedPlanetId = null;
		} else {
			this.followedPlanetId = planetId;
		}
		this.updateSnapshot();
	}

	registerExplosion(
		idA: string,
		idB: string,
		position: THREE.Vector3,
		radius: number,
	) {
		if (this.explosions.some((e) => e.position.distanceTo(position) < 2)) {
			return;
		}
		// Remove the two exploding planets
		this.activePlanetIds.delete(idA);
		this.activePlanetIds.delete(idB);
		if (this.followedPlanetId === idA || this.followedPlanetId === idB) {
			this.followedPlanetId = null;
		}
		this.explosions = [
			...this.explosions,
			{
				id: crypto.randomUUID(),
				radius: radius * 1.5,
				position: position.clone(),
				fragmentCount: 50,
				kind: "explosion",
			},
		];
		this.updateSnapshot();
	}

	/**
	 * Register a small spark effect at a position without removing any planets.
	 * Used for repulse and merge collision visual feedback.
	 */
	registerSpark(position: THREE.Vector3, radius: number, fragmentCount = 10) {
		this.explosions = [
			...this.explosions,
			{
				id: crypto.randomUUID(),
				radius: radius,
				position: position.clone(),
				fragmentCount,
				kind: "spark",
			},
		];
		this.updateSnapshot();
	}

	completeExplosion(explosionId: string) {
		this.explosions = this.explosions.filter(
			(explosion) => explosion.id !== explosionId,
		);
		this.updateSnapshot();
	}

	registerMerge(obsoleteIdA: string, obsoleteIdB: string, newData: Planet) {
		if (
			this.mergeQueue.some(
				(queue) =>
					(queue.data.obsoleteIdA === obsoleteIdA &&
						queue.data.obsoleteIdB === obsoleteIdB) ||
					(queue.data.obsoleteIdA === obsoleteIdB &&
						queue.data.obsoleteIdB === obsoleteIdA),
			)
		)
			return;
		if (this.mergeQueue.some((queue) => queue.data.newData.id === newData.id))
			return;
		this.mergeQueue = [
			...this.mergeQueue,
			{
				id: crypto.randomUUID(),
				data: {
					obsoleteIdA: obsoleteIdA,
					obsoleteIdB: obsoleteIdB,
					newData: newData,
				},
			},
		];
		this.updateSnapshot();
	}

	registerMergeQueue(
		obsoleteIdA: string,
		obsoleteIdB: string,
		newData: Planet,
	) {
		this.registerMerge(obsoleteIdA, obsoleteIdB, newData);
	}

	completeMergeQueue(obsoleteIdA: string, obsoleteIdB: string) {
		this.mergeQueue = this.mergeQueue.filter(
			(queue) =>
				!(
					(queue.data.obsoleteIdA === obsoleteIdA &&
						queue.data.obsoleteIdB === obsoleteIdB) ||
					(queue.data.obsoleteIdA === obsoleteIdB &&
						queue.data.obsoleteIdB === obsoleteIdA)
				),
		);
		this.updateSnapshot();
	}
}
