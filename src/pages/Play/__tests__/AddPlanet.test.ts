import { beforeEach, describe, expect, it } from "vitest";
import { earth } from "@/data/planets";
import { PlanetRegistry } from "../core/PlanetRegistry";
import { SimulationWorld } from "../core/SimulationWorld";

describe("Add Planet - Race Condition Fix", () => {
	let registry: PlanetRegistry;
	let world: SimulationWorld;

	beforeEach(() => {
		registry = new PlanetRegistry();
		registry.register(earth.id, earth);
		world = new SimulationWorld([earth]);
	});

	it("should not update snapshot until after planet is registered in registry", () => {
		// This test verifies the fix for: "can't access property toFixed, radius is undefined"
		// The bug occurred when addPlanetFromTemplate() updated the snapshot immediately,
		// but the planet wasn't registered in PlanetRegistry yet, causing React to render
		// with a planet ID that doesn't exist in the registry.

		const initialSnapshot = world.getSnapshot();
		expect(initialSnapshot.planetIds).toHaveLength(1);
		expect(initialSnapshot.planetIds).toContain(earth.id);

		// Add a new planet
		const newPlanet = world.addPlanetFromTemplate(earth, {
			radius: 2.0,
			position: [5, 0, 0],
			rotationSpeedY: 0.5,
		});

		// After addPlanetFromTemplate(), the snapshot should NOT be updated yet
		// This prevents React from rendering with planet ID before registry has it
		const snapshotBeforeRegister = world.getSnapshot();

		// The snapshot should still be the OLD one (not updated)
		// This is the fix: snapshot is stale until we register and call syncWorld()
		expect(snapshotBeforeRegister.planetIds).toHaveLength(1);

		// Now register the planet in the registry
		registry.register(newPlanet.id, newPlanet);

		// Verify the planet exists in registry
		const registryEntry = registry.get(newPlanet.id);
		expect(registryEntry).toBeDefined();
		expect(registryEntry?.radius).toBe(2.0);
		expect(registryEntry?.position.x).toBe(5);

		// Now update the snapshot (this is what happens after planetRegistry.register)
		world.refreshSnapshot();

		// Now the snapshot is updated (this is what syncWorld() returns)
		const finalSnapshot = world.getSnapshot();
		expect(finalSnapshot.planetIds).toHaveLength(2);
		expect(finalSnapshot.planetIds).toContain(newPlanet.id);

		// At this point, React can safely render because:
		// 1. Planet ID is in snapshot
		// 2. Planet is registered in registry
		// 3. No race condition!
	});

	it("should have all required planet properties when registered", () => {
		// Add planet
		const newPlanet = world.addPlanetFromTemplate(earth, {
			radius: 1.5,
			position: [10, 5, -3],
			rotationSpeedY: 0.8,
		});

		// Register in registry
		registry.register(newPlanet.id, newPlanet);

		// Get from registry
		const entry = registry.get(newPlanet.id);

		// Verify all properties exist (this is what the UI tries to access)
		expect(entry).toBeDefined();
		if (!entry) throw new Error("Entry should exist");

		expect(entry.radius).toBeDefined();
		expect(entry.radius).toBe(1.5);
		expect(typeof entry.radius.toFixed).toBe("function"); // The line that was failing

		expect(entry.position).toBeDefined();
		expect(entry.position.x).toBeDefined();
		expect(typeof entry.position.x.toFixed).toBe("function");
		expect(entry.position.y).toBeDefined();
		expect(entry.position.z).toBeDefined();

		expect(entry.name).toBeDefined();
		expect(entry.mass).toBeDefined();
		expect(entry.rotationSpeedY).toBeDefined();
	});

	it("should handle multiple planets being added sequentially", () => {
		// Add multiple planets
		const planet1 = world.addPlanetFromTemplate(earth, {
			radius: 1.0,
			position: [0, 0, 0],
			rotationSpeedY: 0.5,
		});
		registry.register(planet1.id, planet1);

		const planet2 = world.addPlanetFromTemplate(earth, {
			radius: 2.0,
			position: [10, 0, 0],
			rotationSpeedY: 0.3,
		});
		registry.register(planet2.id, planet2);

		const planet3 = world.addPlanetFromTemplate(earth, {
			radius: 1.5,
			position: [5, 5, 0],
			rotationSpeedY: 0.7,
		});
		registry.register(planet3.id, planet3);

		// Refresh snapshot after all planets are registered
		world.refreshSnapshot();

		// Get final snapshot
		const snapshot = world.getSnapshot();
		expect(snapshot.planetIds).toHaveLength(4); // earth + 3 new planets

		// Verify all planets are in registry with correct properties
		for (const id of snapshot.planetIds) {
			const entry = registry.get(id);
			expect(entry).toBeDefined();
			expect(entry?.radius).toBeDefined();
			expect(entry?.position).toBeDefined();
		}

		// Verify specific planets
		const entry1 = registry.get(planet1.id);
		expect(entry1?.radius).toBe(1.0);

		const entry2 = registry.get(planet2.id);
		expect(entry2?.radius).toBe(2.0);

		const entry3 = registry.get(planet3.id);
		expect(entry3?.radius).toBe(1.5);
	});

	it("should handle planet removal correctly", () => {
		// Add a planet
		const newPlanet = world.addPlanetFromTemplate(earth, {
			radius: 1.2,
			position: [3, 0, 0],
			rotationSpeedY: 0.4,
		});
		registry.register(newPlanet.id, newPlanet);
		world.refreshSnapshot();

		// Verify it exists
		expect(registry.get(newPlanet.id)).toBeDefined();
		const snapshotBefore = world.getSnapshot();
		expect(snapshotBefore.planetIds).toContain(newPlanet.id);

		// Remove planet
		registry.unregister(newPlanet.id);
		world.removePlanet(newPlanet.id);

		// Verify it's gone
		expect(registry.get(newPlanet.id)).toBeUndefined();
		const snapshotAfter = world.getSnapshot();
		expect(snapshotAfter.planetIds).not.toContain(newPlanet.id);
	});
});
