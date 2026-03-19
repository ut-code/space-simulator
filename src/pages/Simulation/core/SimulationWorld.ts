import * as THREE from "three";
import type { ExplosionData } from "@/types/Explosion";
import type { Planet } from "@/types/planet";

type NewPlanetSettings = {
	radius: number;
	position: [number, number, number];
	rotationSpeedY: number;
};

export type SimulationWorldSnapshot = {
	planets: Planet[];
	explosions: ExplosionData[];
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
	private followedPlanetId: string | null = null;

	constructor(initialPlanets: Planet[]) {
		this.planets = initialPlanets.map(clonePlanet);
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
	}

	removePlanet(planetId: string) {
		this.planets = this.planets.filter((planet) => planet.id !== planetId);
		if (this.followedPlanetId === planetId) {
			this.followedPlanetId = null;
		}
	}

	setFollowedPlanetId(planetId: string | null) {
		this.followedPlanetId = planetId;
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
	}

	getSnapshot(): SimulationWorldSnapshot {
		return {
			planets: this.planets.map(clonePlanet),
			explosions: this.explosions.map((explosion) => ({
				...explosion,
				position: explosion.position.clone(),
			})),
			followedPlanetId: this.followedPlanetId,
		};
	}
}
