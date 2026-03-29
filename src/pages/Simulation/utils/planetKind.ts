import { earth, jupiter, sun } from "@/data/planets";
import type { Planet, PlanetKind } from "@/types/planet";

const kindTextureMap: Record<PlanetKind, string> = {
	star: sun.texturePath,
	rocky: earth.texturePath,
	gas: jupiter.texturePath,
};

const STAR_MASS_THRESHOLD = 10000;

export function decidePlanetKind(mass: number, radius: number): PlanetKind {
	if (mass > STAR_MASS_THRESHOLD) return "star";
	if (radius < 2.0) return "rocky";
	return "gas";
}

export function texturePathByKind(kind: PlanetKind): string {
	return kindTextureMap[kind];
}

export function applyAutoKindIfEnabled(
	planet: Planet,
	autoKindAssignment: boolean,
): Planet {
	if (!autoKindAssignment) {
		return planet;
	}

	const kind = decidePlanetKind(planet.mass, planet.radius);
	return {
		...planet,
		kind,
		texturePath: texturePathByKind(kind),
	};
}
