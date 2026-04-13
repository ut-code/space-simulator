import { useTexture } from "@react-three/drei";
import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as THREE from "three";
import type { OrbitControls as Controls } from "three-stdlib";
import { earth, jupiter, mars, sun, venus } from "@/data/planets";
import { PlanetSidebar } from "./components/PlanetSidebar";
import { SimulationCanvas } from "./components/SimulationCanvas";
import { usePlanetSidebar } from "./hooks/usePlanetSidebar";
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
		updatePlanetRadius,
	} = useSimulation(templateId);

	const sidebar = usePlanetSidebar();

	const previewPosition = sidebar.form.position;

	const previewVelocity: [number, number, number] = sidebar.form.velocity;

	const batchPlacePlanets = () => {
		const templateMap: Record<string, typeof earth> = {
			earth,
			sun,
			mars,
			jupiter,
			venus,
		};

		for (const staged of sidebar.stagedPlanets) {
			const template = templateMap[staged.templateKey] ?? earth;
			const [x, y, z] = staged.position;
			const [vx, vy, vz] = staged.velocity;
			const mass = template.mass * (staged.radius / template.radius) ** 3;
			const newPlanet = simulationWorld.createPlanet({
				name: staged.name,
				texturePath: staged.texturePath,
				rotationSpeedY: staged.rotationSpeedY,
				radius: staged.radius,
				width: 64,
				height: 64,
				position: new THREE.Vector3(x, y, z),
				velocity: new THREE.Vector3(vx, vy, vz),
				mass,
			});
			planetRegistry.register(newPlanet.id, newPlanet);
		}

		simulationWorld.refreshSnapshot();
		syncWorld();
		sidebar.clearAllStaged();
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
				posY={previewPosition[1]}
				showPreview={true}
				showGrid={true}
				showAxes={true}
				previewRadius={sidebar.form.radius}
				previewPosition={previewPosition}
				previewVelocity={previewVelocity}
				onPlace={sidebar.setPositionFromClick}
				templateId={templateId ?? "default"}
			/>
			<PlanetSidebar
				worldState={worldState}
				planetRegistry={planetRegistry}
				simulationWorld={simulationWorld}
				syncWorld={syncWorld}
				removePlanet={removePlanet}
				updatePlanetRadius={updatePlanetRadius}
				isOpen={sidebar.isOpen}
				setIsOpen={sidebar.setIsOpen}
				stagedPlanets={sidebar.stagedPlanets}
				form={sidebar.form}
				setForm={sidebar.setForm}
				updateTemplate={sidebar.updateTemplate}
				updatePosition={sidebar.updatePosition}
				updateVelocity={sidebar.updateVelocity}
				toggleAutoKind={sidebar.toggleAutoKind}
				addToStaged={sidebar.addToStaged}
				removeStaged={sidebar.removeStaged}
				clearAllStaged={sidebar.clearAllStaged}
				onBatchPlace={batchPlacePlanets}
				placementMode={placementMode}
				setPlacementMode={setPlacementMode}
			/>
		</div>
	);
}
