import { button, useControls } from "leva";
import type { MutableRefObject } from "react";
import { useEffect, useRef } from "react";
import type { OrbitControls as Controls } from "three-stdlib";
import { earth, jupiter, mars, sun, venus } from "@/data/planets";
import type { PlanetRegistry } from "../core/PlanetRegistry";
import type { SimulationWorld } from "../core/SimulationWorld";

const planetTemplates = { earth, sun, mars, jupiter, venus } as const;

interface UseLevaControlsOptions {
	simulationWorld: SimulationWorld;
	planetRegistry: PlanetRegistry;
	syncWorld: () => void;
	orbitControlsRef: MutableRefObject<Controls | null>;
}

export function useLevaControls({
	simulationWorld,
	planetRegistry,
	syncWorld,
	orbitControlsRef,
}: UseLevaControlsOptions) {
	const selectedPlanetTypeRef = useRef<keyof typeof planetTemplates>("earth");
	const planetControlsRef = useRef<{
		radius: number;
		posX: number;
		posY: number;
		posZ: number;
		rotationSpeedY: number;
	}>({
		radius: 1.2,
		posX: 10,
		posY: 0,
		posZ: 0,
		rotationSpeedY: 0.6,
	});

	const [planetControls, setPlanetControls] = useControls("New Planet", () => {
		return {
			planetType: {
				value: "earth",
				options: {
					Earth: "earth",
					Sun: "sun",
					Mars: "mars",
					Jupiter: "jupiter",
					Venus: "venus",
				},
				onChange: (value) => {
					const selectedType =
						(value as keyof typeof planetTemplates) ?? "earth";
					selectedPlanetTypeRef.current = selectedType;
					const template = planetTemplates[selectedType] ?? earth;
					setPlanetControls({
						radius: template.radius,
						rotationSpeedY: template.rotationSpeedY,
					});
				},
			},
			radius: { value: 1.2, min: 0.2, max: 6, step: 0.1 },
			posX: { value: 10, min: -200, max: 200, step: 0.2 },
			posY: { value: 0, min: -200, max: 200, step: 0.2 },
			posZ: { value: 0, min: -200, max: 200, step: 0.2 },
			rotationSpeedY: { value: 0.6, min: 0, max: 10, step: 0.1 },
			addPlanet: button(() => {
				// Read current values from the ref to avoid stale closure
				const current = planetControlsRef.current;
				console.log("Button clicked! Current planetControls:", current);

				const selectedType = selectedPlanetTypeRef.current;
				const template = planetTemplates[selectedType] ?? earth;

				console.log("Adding planet with settings:", {
					radius: current.radius,
					position: [current.posX, current.posY, current.posZ],
					rotationSpeedY: current.rotationSpeedY,
				});

				const newPlanet = simulationWorld.addPlanetFromTemplate(template, {
					radius: current.radius,
					position: [current.posX, current.posY, current.posZ],
					rotationSpeedY: current.rotationSpeedY,
				});

				console.log("Created planet:", newPlanet.id, newPlanet);

				// CRITICAL: Register in planetRegistry before calling syncWorld()
				// to avoid race condition where React renders with planet ID but no registry entry
				planetRegistry.register(newPlanet.id, newPlanet);
				console.log("Registered planet in registry");

				// Update the snapshot after both operations are complete
				simulationWorld.refreshSnapshot();
				console.log("Refreshed snapshot");

				syncWorld();
				console.log(
					"Synced world, current snapshot:",
					simulationWorld.getSnapshot(),
				);
			}),
		};
	});

	// Keep the ref in sync with the latest Leva control values
	useEffect(() => {
		planetControlsRef.current = planetControls;
	}, [planetControls]);

	const { showGrid, showAxes, showPreview } = useControls("Helpers", {
		showGrid: true,
		showAxes: true,
		showPreview: true,
		resetCameraPosition: button(() => {
			if (orbitControlsRef.current) {
				orbitControlsRef.current.reset();
				orbitControlsRef.current.target.set(0, 0, 0);
				orbitControlsRef.current.update();
			}
		}),
	});

	return {
		planetControls,
		setPlanetControls,
		showGrid,
		showAxes,
		showPreview,
	};
}
