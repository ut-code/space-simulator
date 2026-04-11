import { describe, expect, it } from "vitest";
import { earth, jupiter, sun } from "@/data/planets";
import type { Planet } from "@/types/planet";
import { applyAutoKindIfEnabled, decidePlanetKind } from "../utils/planetKind";

describe("planetKind", () => {
	it("should classify star when mass is greater than 10000", () => {
		expect(decidePlanetKind(10001, 1.0)).toBe("star");
	});

	it("should classify rocky when mass is not star and radius is less than 2.0", () => {
		expect(decidePlanetKind(100, 1.9)).toBe("rocky");
	});

	it("should classify rocky when radius is exactly 2.0", () => {
		expect(decidePlanetKind(100, 2.0)).toBe("rocky");
	});

	it("should classify gas for larger radius", () => {
		expect(decidePlanetKind(100, 2.1)).toBe("gas");
	});

	it("should keep mass=10000 as non-star boundary", () => {
		expect(decidePlanetKind(10000, 1.0)).toBe("rocky");
	});

	it("should set kind and texture when auto assignment is enabled", () => {
		const base: Planet = {
			id: "p1",
			name: "P1",
			mass: 12000,
			radius: 1.0,
			position: earth.position.clone(),
			velocity: earth.velocity.clone(),
			rotationSpeedY: 1,
			texturePath: earth.texturePath,
			width: 64,
			height: 64,
		};

		const updated = applyAutoKindIfEnabled(base, true);
		expect(updated.kind).toBe("star");
		expect(updated.texturePath).toBe(sun.texturePath);

		const rockyBase = { ...base, id: "p2", mass: 100, radius: 1.5 };
		const rockyUpdated = applyAutoKindIfEnabled(rockyBase, true);
		expect(rockyUpdated.kind).toBe("rocky");
		expect(rockyUpdated.texturePath).toBe(earth.texturePath);

		const gasBase = { ...base, id: "p3", mass: 100, radius: 3 };
		const gasUpdated = applyAutoKindIfEnabled(gasBase, true);
		expect(gasUpdated.kind).toBe("gas");
		expect(gasUpdated.texturePath).toBe(jupiter.texturePath);
	});

	it("should not change kind or texture when auto assignment is disabled", () => {
		const base: Planet = {
			id: "p4",
			name: "P4",
			mass: 20000,
			radius: 1.0,
			position: earth.position.clone(),
			velocity: earth.velocity.clone(),
			rotationSpeedY: 1,
			texturePath: "custom-texture.jpg",
			width: 64,
			height: 64,
		};

		const updated = applyAutoKindIfEnabled(base, false);
		expect(updated).toEqual(base);
	});
});
