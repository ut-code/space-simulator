import type { Planet } from "./planet";

export type Template = {
	planets: Planet[];
	cameraLocation: [number, number, number];
};
