import type { Template } from "@/types/templates";
import { asteroidBeltTemplate } from "./Asteroid Belt";
import { binarySystemTemplate } from "./binarySystem";
import { defaultTemplate } from "./default";
import { solarPlanetsTemplate } from "./solarSystem";

export const templates: Map<string, Template> = new Map()
	.set("asteroid-belt", asteroidBeltTemplate)
	.set("binary", binarySystemTemplate)
	.set("solar", solarPlanetsTemplate)
	.set("default", defaultTemplate);
