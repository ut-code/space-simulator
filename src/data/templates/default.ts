import type { Template } from "@/types/templates";
import { earth } from "../planets";

export const defaultTemplate: Template = {
	planets: [earth],
	cameraLocation: [0, 0, 6],
};
