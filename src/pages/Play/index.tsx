import { useTexture } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { OrbitControls as Controls } from "three-stdlib";
import { earth, jupiter, mars, sun, venus } from "@/data/planets";
import { PlacementPanel } from "./components/PlacementPanel";
import { SimulationCanvas } from "./components/SimulationCanvas";
import { useLevaControls } from "./hooks/useLevaControls";
import { useSimulation } from "./hooks/useSimulation";

const planetTexturePaths = [
	earth.texturePath,
	sun.texturePath,
	mars.texturePath,
	jupiter.texturePath,
	venus.texturePath,
];
useTexture.preload(planetTexturePaths);

export default function Page() {
	const [params, _] = useSearchParams();
	const templateId = params.get("template");

	const orbitControlsRef = useRef<Controls | null>(null);
	const [placementMode, setPlacementMode] = useState(false);

	const {
		planetRegistry,
		simulationWorld,
		worldState,
		syncWorld,
		removePlanet,
	} = useSimulation(templateId);

	const { planetControls, setPlanetControls, showGrid, showAxes, showPreview } =
		useLevaControls({
			simulationWorld,
			planetRegistry,
			syncWorld,
			orbitControlsRef,
		});

	const previewPosition = useMemo<[number, number, number]>(
		() => [planetControls.posX, planetControls.posY, planetControls.posZ],
		[planetControls.posX, planetControls.posY, planetControls.posZ],
	);

	const handlePlacement = (position: [number, number, number]) => {
		setPlanetControls({
			posX: position[0],
			posY: position[1],
			posZ: position[2],
		});
	};

	return (
		<div className="relative h-screen w-screen">
			<SimulationCanvas
				worldState={worldState}
				planetRegistry={planetRegistry}
				simulationWorld={simulationWorld}
				syncWorld={syncWorld}
				orbitControlsRef={orbitControlsRef}
				placementMode={placementMode}
				posY={planetControls.posY}
				showPreview={showPreview}
				showGrid={showGrid}
				showAxes={showAxes}
				previewRadius={planetControls.radius}
				previewPosition={previewPosition}
				onPlace={handlePlacement}
				templateId={templateId ?? "default"}
			/>
			<PlacementPanel
				worldState={worldState}
				planetRegistry={planetRegistry}
				simulationWorld={simulationWorld}
				syncWorld={syncWorld}
				removePlanet={removePlanet}
				placementMode={placementMode}
				setPlacementMode={setPlacementMode}
			/>
		</div>
	);
}
