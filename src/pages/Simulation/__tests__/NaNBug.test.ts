import * as THREE from "three";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { earth } from "@/data/planets";
import { PhysicsEngine } from "../core/PhysicsEngine";
import { PlanetRegistry } from "../core/PlanetRegistry";

/**
 * Test to reproduce and verify fix for NaN position bug when adding planets
 */
describe("NaN Bug - Adding planets during simulation", () => {
	let planetRegistry: PlanetRegistry;
	let physicsEngine: PhysicsEngine;

	beforeEach(() => {
		planetRegistry = new PlanetRegistry();
		// Start with Earth
		planetRegistry.register(earth.id, earth);

		// Create physics engine that starts running
		physicsEngine = new PhysicsEngine(planetRegistry, {
			fixedTimestep: 1 / 60,
			maxSubSteps: 5,
			autoStart: true,
		});
	});

	afterEach(() => {
		physicsEngine.destroy();
	});

	it("should not produce NaN positions when adding a small planet near Earth", async () => {
		// Wait for a few physics ticks
		await new Promise((resolve) => setTimeout(resolve, 100));

		// Add a very small planet near Earth (this could trigger NaN with huge accelerations)
		const smallPlanet = {
			id: "small-planet",
			name: "Small",
			texturePath: earth.texturePath,
			rotationSpeedY: 0.6,
			radius: 0.2, // Very small radius
			width: 64,
			height: 64,
			position: new THREE.Vector3(5, 0, 0), // Close to Earth
			velocity: new THREE.Vector3(0, 0, 0),
			mass: 0.001, // Very small mass from computeMass
		};

		planetRegistry.register(smallPlanet.id, smallPlanet);

		// Wait for physics to process
		await new Promise((resolve) => setTimeout(resolve, 200));

		// Check that positions are still valid numbers
		const earth_current = planetRegistry.get(earth.id);
		const small_current = planetRegistry.get(smallPlanet.id);

		expect(earth_current).toBeDefined();
		expect(small_current).toBeDefined();

		if (earth_current && small_current) {
			// Check Earth's position
			expect(Number.isFinite(earth_current.position.x)).toBe(true);
			expect(Number.isFinite(earth_current.position.y)).toBe(true);
			expect(Number.isFinite(earth_current.position.z)).toBe(true);

			// Check small planet's position
			expect(Number.isFinite(small_current.position.x)).toBe(true);
			expect(Number.isFinite(small_current.position.y)).toBe(true);
			expect(Number.isFinite(small_current.position.z)).toBe(true);

			// Check velocities too
			expect(Number.isFinite(earth_current.velocity.x)).toBe(true);
			expect(Number.isFinite(earth_current.velocity.y)).toBe(true);
			expect(Number.isFinite(earth_current.velocity.z)).toBe(true);

			expect(Number.isFinite(small_current.velocity.x)).toBe(true);
			expect(Number.isFinite(small_current.velocity.y)).toBe(true);
			expect(Number.isFinite(small_current.velocity.z)).toBe(true);
		}
	});

	it("should handle planets with very small mass without producing NaN", async () => {
		const tinyPlanet = {
			id: "tiny-planet",
			name: "Tiny",
			texturePath: earth.texturePath,
			rotationSpeedY: 0.6,
			radius: 0.1,
			width: 64,
			height: 64,
			position: new THREE.Vector3(3, 0, 0),
			velocity: new THREE.Vector3(0, 0, 0),
			mass: 0.00001, // Extremely small mass
		};

		planetRegistry.register(tinyPlanet.id, tinyPlanet);

		// Run physics for several frames
		await new Promise((resolve) => setTimeout(resolve, 300));

		const tiny_current = planetRegistry.get(tinyPlanet.id);
		expect(tiny_current).toBeDefined();

		if (tiny_current) {
			expect(Number.isFinite(tiny_current.position.x)).toBe(true);
			expect(Number.isFinite(tiny_current.position.y)).toBe(true);
			expect(Number.isFinite(tiny_current.position.z)).toBe(true);
			expect(Number.isFinite(tiny_current.velocity.x)).toBe(true);
			expect(Number.isFinite(tiny_current.velocity.y)).toBe(true);
			expect(Number.isFinite(tiny_current.velocity.z)).toBe(true);
		}
	});

	it("should skip planets with invalid data (zero mass) and not crash", async () => {
		const invalidPlanet = {
			id: "invalid-planet",
			name: "Invalid",
			texturePath: earth.texturePath,
			rotationSpeedY: 0.6,
			radius: 1.0,
			width: 64,
			height: 64,
			position: new THREE.Vector3(10, 0, 0),
			velocity: new THREE.Vector3(0, 0, 0),
			mass: 0, // Invalid: zero mass
		};

		planetRegistry.register(invalidPlanet.id, invalidPlanet);

		// Run physics - should skip this planet without crashing
		await new Promise((resolve) => setTimeout(resolve, 200));

		// Earth should still be valid
		const earth_current = planetRegistry.get(earth.id);
		expect(earth_current).toBeDefined();

		if (earth_current) {
			expect(Number.isFinite(earth_current.position.x)).toBe(true);
			expect(Number.isFinite(earth_current.position.y)).toBe(true);
			expect(Number.isFinite(earth_current.position.z)).toBe(true);
		}
	});

	it("should skip planets with NaN position and not propagate NaN", async () => {
		const nanPlanet = {
			id: "nan-planet",
			name: "NaN",
			texturePath: earth.texturePath,
			rotationSpeedY: 0.6,
			radius: 1.0,
			width: 64,
			height: 64,
			position: new THREE.Vector3(Number.NaN, 0, 0), // Invalid: NaN position
			velocity: new THREE.Vector3(0, 0, 0),
			mass: 1,
		};

		planetRegistry.register(nanPlanet.id, nanPlanet);

		// Run physics - should skip this planet without propagating NaN
		await new Promise((resolve) => setTimeout(resolve, 200));

		// Earth should still be valid and not affected by the NaN planet
		const earth_current = planetRegistry.get(earth.id);
		expect(earth_current).toBeDefined();

		if (earth_current) {
			expect(Number.isFinite(earth_current.position.x)).toBe(true);
			expect(Number.isFinite(earth_current.position.y)).toBe(true);
			expect(Number.isFinite(earth_current.position.z)).toBe(true);
			expect(Number.isFinite(earth_current.velocity.x)).toBe(true);
			expect(Number.isFinite(earth_current.velocity.y)).toBe(true);
			expect(Number.isFinite(earth_current.velocity.z)).toBe(true);
		}
	});
});
