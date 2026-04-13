import * as THREE from "three";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { sun } from "@/data/planets";
import type { Planet } from "@/types/planet";
import { PhysicsEngine, type PhysicsEvent } from "../core/PhysicsEngine";
import { PlanetRegistry } from "../core/PlanetRegistry";

describe("PhysicsEngine - Standalone Physics (No React)", () => {
	let registry: PlanetRegistry;
	let engine: PhysicsEngine;
	let events: PhysicsEvent[];

	beforeEach(() => {
		registry = new PlanetRegistry();
		events = [];
	});

	afterEach(() => {
		if (engine) {
			engine.destroy();
		}
	});

	it("should run physics without React", () => {
		// Create a simple planet
		const planet: Planet = {
			id: "test-planet-1",
			name: "Test Planet",
			mass: 1000,
			radius: 1,
			position: new THREE.Vector3(0, 0, 0),
			velocity: new THREE.Vector3(1, 0, 0),
			rotationSpeedY: 0.5,
			texturePath: "test.jpg",
			width: 32,
			height: 32,
		};

		registry.register(planet.id, planet);

		// Create physics engine with manual start
		engine = new PhysicsEngine(registry, {
			fixedTimestep: 1 / 60,
			autoStart: false,
		});

		expect(engine.isRunning()).toBe(false);

		// Subscribe to events
		engine.on((event) => {
			events.push(event);
		});

		// Manually step physics
		const initialPosition = registry.get(planet.id)?.position.clone();
		expect(initialPosition).toBeDefined();
		if (!initialPosition) {
			throw new Error("Initial position should be defined");
		}

		// Start the engine
		engine.start();
		expect(engine.isRunning()).toBe(true);

		// Wait for some physics updates
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				engine.stop();

				// Physics should have updated the position
				const updatedPosition = registry.get(planet.id)?.position;
				expect(updatedPosition).toBeDefined();
				if (updatedPosition) {
					expect(updatedPosition.x).toBeGreaterThan(initialPosition.x);
				}

				// Should have received update events
				const updateEvents = events.filter((e) => e.type === "update");
				expect(updateEvents.length).toBeGreaterThan(0);

				resolve();
			}, 100);
		});
	});

	it("should detect collisions and emit merge events", () => {
		// Create two planets on collision course
		const planet1: Planet = {
			id: "planet-1",
			name: "Planet 1",
			mass: 1000,
			radius: 1,
			position: new THREE.Vector3(0, 0, 0),
			velocity: new THREE.Vector3(1, 0, 0),
			rotationSpeedY: 0.5,
			texturePath: "test1.jpg",
			width: 32,
			height: 32,
		};

		const planet2: Planet = {
			id: "planet-2",
			name: "Planet 2",
			mass: 1000,
			radius: 1,
			position: new THREE.Vector3(1.5, 0, 0),
			velocity: new THREE.Vector3(-1, 0, 0),
			rotationSpeedY: 0.5,
			texturePath: "test2.jpg",
			width: 32,
			height: 32,
		};

		registry.register(planet1.id, planet1);
		registry.register(planet2.id, planet2);

		// Create physics engine
		engine = new PhysicsEngine(registry, {
			fixedTimestep: 1 / 60,
			autoStart: false,
		});

		// Subscribe to events
		engine.on((event) => {
			events.push(event);
		});

		engine.start();

		// Wait for collision
		return new Promise<void>((resolve) => {
			setTimeout(() => {
				engine.stop();

				// Should have collision events
				const mergeEvents = events.filter((e) => e.type === "collision:merge");
				const explodeEvents = events.filter(
					(e) => e.type === "collision:explode",
				);

				// Should have either merge or explode event
				expect(mergeEvents.length + explodeEvents.length).toBeGreaterThan(0);

				resolve();
			}, 200);
		});
	});

	it("should use fixed timestep independent of frame rate", () => {
		const planet: Planet = {
			id: "test-planet",
			name: "Test",
			mass: 1000,
			radius: 1,
			position: new THREE.Vector3(0, 0, 0),
			velocity: new THREE.Vector3(10, 0, 0),
			rotationSpeedY: 0,
			texturePath: "test.jpg",
			width: 32,
			height: 32,
		};

		registry.register(planet.id, planet);

		engine = new PhysicsEngine(registry, {
			fixedTimestep: 1 / 60,
			maxSubSteps: 5,
			autoStart: true,
		});

		expect(engine.getFixedTimestep()).toBe(1 / 60);

		return new Promise<void>((resolve) => {
			setTimeout(() => {
				engine.stop();

				const position = registry.get(planet.id)?.position;
				expect(position).toBeDefined();

				// Position should have changed
				expect(position?.x).toBeGreaterThan(0);

				resolve();
			}, 100);
		});
	});

	it("should auto-assign kind and texture on collision merge when enabled", () => {
		const planet1: Planet = {
			id: "heavy-planet",
			name: "Heavy",
			mass: 9000,
			radius: 1,
			position: new THREE.Vector3(0, 0, 0),
			velocity: new THREE.Vector3(0.1, 0, 0),
			rotationSpeedY: 0.5,
			texturePath: "heavy.jpg",
			width: 32,
			height: 32,
		};

		const planet2: Planet = {
			id: "light-planet",
			name: "Light",
			mass: 2000,
			radius: 1,
			position: new THREE.Vector3(1.5, 0, 0),
			velocity: new THREE.Vector3(0, 0, 0),
			rotationSpeedY: 0.3,
			texturePath: "light.jpg",
			width: 32,
			height: 32,
		};

		registry.register(planet1.id, planet1);
		registry.register(planet2.id, planet2);

		engine = new PhysicsEngine(registry, {
			fixedTimestep: 1 / 60,
			autoStart: false,
		});
		engine.setAutoKindAssignment(true);

		engine.on((event) => {
			events.push(event);
		});

		engine.start();

		return new Promise<void>((resolve) => {
			setTimeout(() => {
				engine.stop();

				const mergeEvents = events.filter(
					(e): e is Extract<PhysicsEvent, { type: "collision:merge" }> =>
						e.type === "collision:merge",
				);
				expect(mergeEvents.length).toBeGreaterThan(0);

				const merged = mergeEvents[0]?.newPlanet;
				expect(merged).toBeDefined();
				expect(merged?.kind).toBe("star");
				expect(merged?.texturePath).toBe(sun.texturePath);

				resolve();
			}, 120);
		});
	});

	it("should assign kind and texture on collision merge even when disabled", () => {
		const planet1: Planet = {
			id: "heavy-planet-off",
			name: "HeavyOff",
			mass: 9000,
			radius: 1,
			position: new THREE.Vector3(0, 0, 0),
			velocity: new THREE.Vector3(0.1, 0, 0),
			rotationSpeedY: 0.5,
			texturePath: "heavy-off.jpg",
			width: 32,
			height: 32,
		};

		const planet2: Planet = {
			id: "light-planet-off",
			name: "LightOff",
			mass: 2000,
			radius: 1,
			position: new THREE.Vector3(1.5, 0, 0),
			velocity: new THREE.Vector3(0, 0, 0),
			rotationSpeedY: 0.3,
			texturePath: "light-off.jpg",
			width: 32,
			height: 32,
		};

		registry.register(planet1.id, planet1);
		registry.register(planet2.id, planet2);

		engine = new PhysicsEngine(registry, {
			fixedTimestep: 1 / 60,
			autoStart: false,
		});
		engine.setAutoKindAssignment(false);

		engine.on((event) => {
			events.push(event);
		});

		engine.start();

		return new Promise<void>((resolve) => {
			setTimeout(() => {
				engine.stop();

				const mergeEvents = events.filter(
					(e): e is Extract<PhysicsEvent, { type: "collision:merge" }> =>
						e.type === "collision:merge",
				);
				expect(mergeEvents.length).toBeGreaterThan(0);

				const merged = mergeEvents[0]?.newPlanet;
				expect(merged).toBeDefined();
				expect(merged?.kind).toBe("star");
				expect(merged?.texturePath).toBe(sun.texturePath);

				resolve();
			}, 120);
		});
	});
});
