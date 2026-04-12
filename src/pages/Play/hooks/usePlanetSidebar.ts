import { useCallback, useState } from "react";
import { earth, jupiter, mars, sun, venus } from "@/data/planets";
import type { Planet } from "@/types/planet";
import type { StagedPlanet } from "../types/sidebar";

const planetTemplates: Record<string, Planet> = {
	earth,
	sun,
	mars,
	jupiter,
	venus,
};

const defaultForm = (): StagedPlanet => ({
	id: crypto.randomUUID(),
	templateKey: "earth",
	name: "Earth",
	texturePath: earth.texturePath,
	radius: earth.radius,
	rotationSpeedY: earth.rotationSpeedY,
	position: [10, 0, 0],
});

export function usePlanetSidebar() {
	const [isOpen, setIsOpen] = useState(true);
	const [stagedPlanets, setStagedPlanets] = useState<StagedPlanet[]>([]);
	const [form, setForm] = useState<StagedPlanet>(defaultForm());

	const updateTemplate = useCallback((templateKey: string) => {
		const template = planetTemplates[templateKey];
		if (!template) return;
		setForm((prev) => ({
			...prev,
			id: crypto.randomUUID(),
			templateKey,
			name: template.name,
			texturePath: template.texturePath,
			radius: template.radius,
			rotationSpeedY: template.rotationSpeedY,
		}));
	}, []);

	const updatePosition = useCallback(
		(axis: "posX" | "posY" | "posZ", value: number) => {
			setForm((prev) => {
				const idx = axis === "posX" ? 0 : axis === "posY" ? 1 : 2;
				const newPos: [number, number, number] = [...prev.position] as [
					number,
					number,
					number,
				];
				newPos[idx] = value;
				return { ...prev, position: newPos };
			});
		},
		[],
	);

	const setPositionFromClick = useCallback((pos: [number, number, number]) => {
		setForm((prev) => ({ ...prev, position: pos }));
	}, []);

	const addToStaged = useCallback(() => {
		setStagedPlanets((prev) => [...prev, form]);
		setForm((prev) => ({
			...defaultForm(),
			// keep the position for convenient consecutive placement
			position: prev.position,
		}));
	}, [form]);

	const removeStaged = useCallback((stagedId: string) => {
		setStagedPlanets((prev) => prev.filter((s) => s.id !== stagedId));
	}, []);

	const clearAllStaged = useCallback(() => {
		setStagedPlanets([]);
	}, []);

	return {
		isOpen,
		setIsOpen,
		stagedPlanets,
		setStagedPlanets,
		form,
		setForm,
		updateTemplate,
		updatePosition,
		setPositionFromClick,
		addToStaged,
		removeStaged,
		clearAllStaged,
	};
}
