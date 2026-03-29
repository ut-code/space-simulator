import { describe, expect, it } from "vitest";
import { earth, jupiter } from "@/data/planets";
import type { Planet } from "@/types/planet";
import { SimulationWorld } from "../core/SimulationWorld";

/**
 * Test edge cases in planet creation that could produce NaN mass
 */
describe("SimulationWorld - Planet Creation Edge Cases", () => {
	it("should handle valid planet creation", () => {
		const world = new SimulationWorld([earth]);

		const newPlanet = world.addPlanetFromTemplate(earth, {
			radius: 1.5,
			position: [10, 0, 0],
			rotationSpeedY: 0.5,
		});

		expect(newPlanet.mass).toBeGreaterThan(0);
		expect(Number.isFinite(newPlanet.mass)).toBe(true);
		expect(newPlanet.radius).toBe(1.5);
		expect(newPlanet.position.x).toBe(10);
	});

	it("should handle very small radius without producing NaN mass", () => {
		const world = new SimulationWorld([earth]);

		const newPlanet = world.addPlanetFromTemplate(earth, {
			radius: 0.1, // Very small
			position: [10, 0, 0],
			rotationSpeedY: 0.5,
		});

		expect(newPlanet.mass).toBeGreaterThan(0);
		expect(Number.isFinite(newPlanet.mass)).toBe(true);
		expect(newPlanet.radius).toBe(0.1);
	});

	it("should handle template with zero radius by falling back to unit mass", () => {
		const invalidTemplate: Planet = {
			...earth,
			radius: 0, // Invalid
		};

		const world = new SimulationWorld([earth]);

		const newPlanet = world.addPlanetFromTemplate(invalidTemplate, {
			radius: 1.0,
			position: [10, 0, 0],
			rotationSpeedY: 0.5,
		});

		// Should fallback to unit mass instead of NaN
		expect(newPlanet.mass).toBe(1);
		expect(Number.isFinite(newPlanet.mass)).toBe(true);
	});

	it("should handle template with NaN mass by falling back to unit mass", () => {
		const invalidTemplate: Planet = {
			...earth,
			mass: Number.NaN, // Invalid
		};

		const world = new SimulationWorld([earth]);

		const newPlanet = world.addPlanetFromTemplate(invalidTemplate, {
			radius: 1.0,
			position: [10, 0, 0],
			rotationSpeedY: 0.5,
		});

		// Should fallback to unit mass instead of NaN
		expect(newPlanet.mass).toBe(1);
		expect(Number.isFinite(newPlanet.mass)).toBe(true);
	});

	it("should reject invalid position (NaN)", () => {
		const world = new SimulationWorld([earth]);

		expect(() => {
			world.addPlanetFromTemplate(earth, {
				radius: 1.0,
				position: [Number.NaN, 0, 0], // Invalid
				rotationSpeedY: 0.5,
			});
		}).toThrow("Invalid planet position");
	});

	it("should reject invalid radius (zero)", () => {
		const world = new SimulationWorld([earth]);

		expect(() => {
			world.addPlanetFromTemplate(earth, {
				radius: 0, // Invalid
				position: [10, 0, 0],
				rotationSpeedY: 0.5,
			});
		}).toThrow("Invalid planet radius");
	});

	it("should reject invalid radius (negative)", () => {
		const world = new SimulationWorld([earth]);

		expect(() => {
			world.addPlanetFromTemplate(earth, {
				radius: -1, // Invalid
				position: [10, 0, 0],
				rotationSpeedY: 0.5,
			});
		}).toThrow("Invalid planet radius");
	});

	it("should reject invalid rotationSpeedY (NaN)", () => {
		const world = new SimulationWorld([earth]);

		expect(() => {
			world.addPlanetFromTemplate(earth, {
				radius: 1.0,
				position: [10, 0, 0],
				rotationSpeedY: Number.NaN, // Invalid
			});
		}).toThrow("Invalid planet rotationSpeedY");
	});

	it("should use manual mass when provided", () => {
		const world = new SimulationWorld([earth]);

		const newPlanet = world.addPlanetFromTemplate(earth, {
			radius: 1.5,
			mass: 12345,
			position: [10, 0, 0],
			rotationSpeedY: 0.5,
		});

		expect(newPlanet.mass).toBe(12345);
	});

	it("should reject invalid mass when provided", () => {
		const world = new SimulationWorld([earth]);

		expect(() => {
			world.addPlanetFromTemplate(earth, {
				radius: 1.5,
				mass: 0,
				position: [10, 0, 0],
				rotationSpeedY: 0.5,
			});
		}).toThrow("Invalid planet mass");
	});

	it("should auto-assign kind and texture on add when enabled", () => {
		const world = new SimulationWorld([earth]);

		const newPlanet = world.addPlanetFromTemplate(earth, {
			radius: 4.0,
			position: [10, 0, 0],
			rotationSpeedY: 0.5,
			autoKindAssignment: true,
		});

		expect(newPlanet.kind).toBe("gas");
		expect(newPlanet.texturePath).toBe(jupiter.texturePath);
	});

	it("should keep template texture on add when auto assignment is disabled", () => {
		const world = new SimulationWorld([earth]);

		const newPlanet = world.addPlanetFromTemplate(earth, {
			radius: 4.0,
			position: [10, 0, 0],
			rotationSpeedY: 0.5,
			autoKindAssignment: false,
		});

		expect(newPlanet.texturePath).toBe(earth.texturePath);
	});
});
