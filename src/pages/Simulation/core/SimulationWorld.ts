import * as THREE from "three";
import type { ExplosionData } from "@/types/Explosion";
import type { Planet } from "@/types/planet";

type NewPlanetSettings = {
	radius: number;
	position: [number, number, number];
	rotationSpeedY: number;
};

export type mergeQueueProps = {
	obsoleteIdA: string;
	obsoleteIdB: string;
	newData: Planet;
};

export type SimulationWorldSnapshot = {
	planets: Planet[];
	explosions: ExplosionData[];
	mergeQueue: { id: string; data: mergeQueueProps }[];
	followedPlanetId: string | null;
};

function computeMass(radius: number, mass: number, newRadius: number) {
	return mass * (newRadius / radius) ** 3;
}

function clonePlanet(planet: Planet): Planet {
	return {
		...planet,
		position: planet.position.clone(),
		velocity: planet.velocity.clone(),
	};
}

export class SimulationWorld {
	private planets: Planet[];
	private explosions: ExplosionData[] = [];
	private mergeQueue: { id: string; data: mergeQueueProps }[] = [];
	private followedPlanetId: string | null = null;
	private snapshot: SimulationWorldSnapshot;

	constructor(initialPlanets: Planet[]) {
		this.planets = initialPlanets.map(clonePlanet);
		this.snapshot = this.buildSnapshot();
	}

	private buildSnapshot(): SimulationWorldSnapshot {
		return {
			planets: this.planets,
			explosions: this.explosions,
			mergeQueue: this.mergeQueue,
			followedPlanetId: this.followedPlanetId,
		};
	}

	private updateSnapshot() {
		this.snapshot = this.buildSnapshot();
	}

	addPlanetFromTemplate(template: Planet, settings: NewPlanetSettings) {
		const [posX, posY, posZ] = settings.position;
		const mass = computeMass(template.radius, template.mass, settings.radius);
		this.planets = [
			...this.planets,
			{
				id: crypto.randomUUID(),
				name: template.name,
				texturePath: template.texturePath,
				rotationSpeedY: settings.rotationSpeedY,
				radius: settings.radius,
				width: 64,
				height: 64,
				position: new THREE.Vector3(posX, posY, posZ),
				velocity: new THREE.Vector3(0, 0, 0),
				mass,
			},
		];
		this.updateSnapshot();
	}

	addPlanet(data: Planet) {
		this.planets = [
			...this.planets,
			{
				...data,
			},
		];
		this.updateSnapshot();
	}

	removePlanet(planetId: string) {
		this.planets = this.planets.filter((planet) => planet.id !== planetId);
		if (this.followedPlanetId === planetId) {
			this.followedPlanetId = null;
		}
		this.updateSnapshot();
	}

	setFollowedPlanetId(planetId: string | null) {
		this.followedPlanetId = planetId;
		this.updateSnapshot();
	}

	registerExplosion(position: THREE.Vector3, radius: number) {
		if (this.explosions.some((e) => e.position.distanceTo(position) < 2)) {
			return;
		}
		this.explosions = [
			...this.explosions,
			{
				id: crypto.randomUUID(),
				radius: radius * 1.5,
				position: position.clone(),
				fragmentCount: 50,
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

	registerMergeQueue(
		obsoleteIdA: string,
		obsoleteIdB: string,
		newData: Planet,
	) {
		if (
			this.mergeQueue.some(
				(queue) =>
					queue.data.obsoleteIdA === obsoleteIdA &&
					queue.data.obsoleteIdB === obsoleteIdB,
			)
		)
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
		console.log(this.mergeQueue);
		this.updateSnapshot();
	}

	completeMergeQueue(obsoleteIdA: string, obsoleteIdB: string) {
		this.mergeQueue = this.mergeQueue.filter(
			(queue) =>
				!(
					queue.data.obsoleteIdA === obsoleteIdA &&
					queue.data.obsoleteIdB === obsoleteIdB
				),
		);
		this.updateSnapshot();
	}

	getSnapshot(): SimulationWorldSnapshot {
		return this.snapshot;
	}
}
