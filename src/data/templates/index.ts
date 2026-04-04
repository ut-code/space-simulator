import type { Template } from "@/types/templates";
import { defaultTemplate } from "./default";
import { solarPlanetsTemplate } from "./solarSystem";

export const templates: Map<string, Template> = new Map()
	.set("solar", solarPlanetsTemplate)
	.set("default", defaultTemplate);
