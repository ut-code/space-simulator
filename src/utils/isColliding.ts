import type { Planet } from "@/types/planet";

export function isColliding(planet1: Planet, planet2: Planet): boolean {
	const distanceSquared = planet1.position.distanceToSquared(planet2.position);

	const radiusSum = planet1.radius + planet2.radius;

	return distanceSquared <= radiusSum ** 2;
}
