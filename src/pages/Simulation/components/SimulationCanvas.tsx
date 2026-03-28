import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import type { OrbitControls as Controls } from "three-stdlib";
import type { PlanetRegistry } from "../core/PlanetRegistry";
import type { SimulationWorld } from "../core/SimulationWorld";
import { CameraController } from "./CameraController";
import { Explosion } from "./Explosion";
import { PlanetMesh } from "./PlanetMesh";
import { PlacementSurface, PreviewPlanet } from "./PlanetPlacementView";

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
	onPlace: (position: [number, number, number]) => void;
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
	onPlace,
}: SimulationCanvasProps) {
	return (
		<Canvas
			camera={{ position: [0, 0, 6] }}
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
				<PreviewPlanet radius={previewRadius} position={previewPosition} />
			)}
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
