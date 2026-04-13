import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import type { OrbitControls as Controls } from "three-stdlib";
import { templates } from "@/data/templates";
import { defaultTemplate } from "@/data/templates/default";
import type { PlanetRegistry } from "../core/PlanetRegistry";
import type { SimulationWorld } from "../core/SimulationWorld";
import type { StagedPlanet } from "../types/sidebar";
import { CameraController } from "./CameraController";
import { Explosion } from "./Explosion";
import { PlanetMesh } from "./PlanetMesh";
import {
	PlacementSurface,
	PreviewPlanet,
	StagedPreviewPlanet,
} from "./PlanetPlacementView";

type SimulationCanvasProps = {
	worldState: ReturnType<SimulationWorld["getSnapshot"]>;
	planetRegistry: PlanetRegistry;
	simulationWorld: SimulationWorld;
	syncWorld: () => void;
	orbitControlsRef: React.RefObject<Controls | null>;
	placementMode: boolean;
	posY: number;
	showPreview: boolean;
	showGrid: boolean;
	showAxes: boolean;
	previewRadius: number;
	previewPosition: [number, number, number];
	previewVelocity: [number, number, number];
	onPlace: (position: [number, number, number]) => void;
	templateId: string;
	stagedPlanets: StagedPlanet[];
	showStagedPreview: boolean;
};

export function SimulationCanvas({
	worldState,
	planetRegistry,
	simulationWorld,
	syncWorld,
	orbitControlsRef,
	placementMode,
	posY,
	showPreview,
	showGrid,
	showAxes,
	previewRadius,
	previewPosition,
	previewVelocity,
	onPlace,
	templateId,
	stagedPlanets,
	showStagedPreview,
}: SimulationCanvasProps) {
	const initialCameraPosition: [number, number, number] =
		templates.get(templateId)?.cameraLocation ?? defaultTemplate.cameraLocation;
	return (
		<Canvas
			camera={{ position: initialCameraPosition, far: 5000 }}
			onCreated={({ gl }) => {
				gl.setClearColor("#000000", 1);
			}}
			style={{ width: "100vw", height: "100vh" }}
		>
			{/* Adds ambient and directional light so we can see the 3D shape */}
			<ambientLight intensity={1.2} />
			<pointLight position={[10, 10, 10]} intensity={3} />

			<CameraController
				followedPlanetId={worldState.followedPlanetId}
				planetRegistry={planetRegistry}
				orbitControlsRef={orbitControlsRef}
			/>

			{worldState.planetIds.map((planetId) => (
				<Suspense key={planetId} fallback={null}>
					<PlanetMesh
						planetId={planetId}
						planetRegistry={planetRegistry}
						onSelect={(id) => {
							simulationWorld.setFollowedPlanetId(id);
							syncWorld();
						}}
					/>
				</Suspense>
			))}

			<PlacementSurface
				enabled={placementMode}
				yLevel={posY}
				onPlace={onPlace}
			/>

			{showPreview && (
				<PreviewPlanet
					radius={previewRadius}
					position={previewPosition}
					velocity={previewVelocity}
				/>
			)}

			{/* Staged planet previews (amber to distinguish from main preview) */}
			{showStagedPreview &&
				stagedPlanets.map((staged) => (
					<StagedPreviewPlanet
						key={staged.id}
						radius={staged.radius}
						position={staged.position}
						velocity={staged.velocity}
					/>
				))}
			{showGrid && <gridHelper args={[200, 50, "#1f2937", "#0f172a"]} />}
			{showAxes && <axesHelper args={[20]} />}

			{worldState.explosions.map((exp) => (
				<Explosion
					key={exp.id}
					explosion={exp}
					onComplete={() => {
						simulationWorld.completeExplosion(exp.id);
						syncWorld();
					}}
				/>
			))}

			{/* Optional background and controls */}
			<Stars
				radius={100}
				depth={50}
				count={5000}
				factor={4}
				saturation={0}
				fade
				speed={1}
			/>
			<OrbitControls ref={orbitControlsRef} enableZoom={true} />
		</Canvas>
	);
}
