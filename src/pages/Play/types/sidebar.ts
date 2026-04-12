export type StagedPlanet = {
	id: string; // unique staging id (not the final planet id)
	templateKey: string;
	name: string;
	texturePath: string;
	radius: number;
	rotationSpeedY: number;
	position: [number, number, number];
};

export type PlanetSidebarState = {
	stagedPlanets: StagedPlanet[];
	isOpen: boolean;
};
