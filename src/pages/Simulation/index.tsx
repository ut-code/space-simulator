import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { button, useControls } from "leva";
import {
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { OrbitControls as Controls } from "three-stdlib";
import { earth, jupiter, mars, sun, venus } from "@/data/planets";
import type { Planet } from "@/types/planet";
import { CameraController } from "./components/CameraController";
import { Explosion } from "./components/Explosion";
import { MergeController } from "./components/MergeController";
import { PlanetMesh } from "./components/PlanetMesh";
import {
	PlacementSurface,
	PreviewPlanet,
} from "./components/PlanetPlacementView";
import { PhysicsEngine } from "./core/PhysicsEngine";
import {
	PlanetRegistry,
	type PlanetRegistryEntry,
} from "./core/PlanetRegistry";
import { SimulationWorld } from "./core/SimulationWorld";

const planetTexturePaths = [
	earth.texturePath,
	sun.texturePath,
	mars.texturePath,
	jupiter.texturePath,
	venus.texturePath,
];
useTexture.preload(planetTexturePaths);

const planetTemplates = { earth, sun, mars, jupiter, venus } as const;

export default function Page() {
	const orbitControlsRef = useRef<Controls | null>(null);
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
	const planetRegistry = useMemo(() => {
		const registry = new PlanetRegistry();
		registry.register(earth.id, earth);
		return registry;
	}, []);
	const simulationWorld = useMemo(() => new SimulationWorld([earth]), []);

	// Initialize physics engine
	const physicsEngine = useMemo(() => {
		return new PhysicsEngine(planetRegistry, {
			fixedTimestep: 1 / 60, // 60Hz physics
			maxSubSteps: 5,
			autoStart: true,
		});
	}, [planetRegistry]);

	const [worldState, setWorldState] = useState(() =>
		simulationWorld.getSnapshot(),
	);

	const [placementMode, setPlacementMode] = useState(false);
	const [placementPanelOpen, setPlacementPanelOpen] = useState(true);

	const syncWorld = useCallback(() => {
		setWorldState(simulationWorld.getSnapshot());
	}, [simulationWorld]);

	// Listen to physics events
	useEffect(() => {
		const unsubscribe = physicsEngine.on((event) => {
			if (event.type === "collision:merge") {
				simulationWorld.registerMerge(event.idA, event.idB, event.newPlanet);
				syncWorld();
			} else if (event.type === "collision:explode") {
				simulationWorld.registerExplosion(event.position, event.radius);
				syncWorld();
			}
		});

		return () => {
			unsubscribe();
			physicsEngine.destroy();
		};
	}, [physicsEngine, simulationWorld, syncWorld]);

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

	const removePlanet = (planetId: string) => {
		planetRegistry.unregister(planetId);
		simulationWorld.removePlanet(planetId);
		syncWorld();
	};

	const panelPlanets = worldState.planetIds
		.map((planetId) => {
			const planet = planetRegistry.get(planetId);
			if (!planet) return null;
			return { planetId, planet };
		})
		.filter(
			(item): item is { planetId: string; planet: PlanetRegistryEntry } =>
				item !== null,
		);

	console.log("Rendering with worldState.planetIds:", worldState.planetIds);
	console.log("panelPlanets:", panelPlanets);

	return (
		<div className="relative h-screen w-screen">
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
					yLevel={planetControls.posY}
					onPlace={handlePlacement}
				/>

				{showPreview && (
					<PreviewPlanet
						radius={planetControls.radius}
						position={previewPosition}
					/>
				)}
				{showGrid && <gridHelper args={[200, 50, "#1f2937", "#0f172a"]} />}
				{showAxes && <axesHelper args={[20]} />}

				{worldState.mergeQueue.map((queue) => (
					<Suspense key={queue.id}>
						<MergeController
							queueData={queue.data}
							onAdd={(newData: Planet) => {
								planetRegistry.register(newData.id, newData);
								simulationWorld.addPlanet(newData);
								syncWorld();
							}}
							onDelete={(obsoleteId: string) => {
								planetRegistry.unregister(obsoleteId);
								simulationWorld.removePlanet(obsoleteId);
								syncWorld();
							}}
							onComplete={(obsoleteIdA: string, obsoleteIdB: string) => {
								simulationWorld.completeMergeQueue(obsoleteIdA, obsoleteIdB);
								syncWorld();
							}}
						/>
					</Suspense>
				))}

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
			<div className="absolute left-4 top-4 w-80 max-h-[75vh] overflow-y-auto rounded-lg bg-black/70 p-3 text-sm text-white backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<strong>クリック配置</strong>
					<div className="flex items-center gap-2">
						<label className="flex items-center gap-1.5">
							<input
								type="checkbox"
								checked={placementMode}
								onChange={(event) => setPlacementMode(event.target.checked)}
							/>
							ON
						</label>
						<button
							type="button"
							onClick={() => setPlacementPanelOpen((prev) => !prev)}
							className="cursor-pointer rounded-md border border-white/40 bg-transparent px-2 py-0.5 text-xs text-white"
						>
							{placementPanelOpen ? "たたむ" : "ひらく"}
						</button>
					</div>
				</div>
				{placementPanelOpen && (
					<>
						<p className="mb-3 mt-2 opacity-[0.85]">
							ONの間は水色の面をクリックすると、座標が自動入力されます。
						</p>

						{worldState.followedPlanetId && (
							<div className="mb-3 mt-2 rounded border border-blue-500/30 bg-blue-500/10 p-2">
								<div className="flex items-center justify-between">
									<span className="text-blue-200">
										追尾中: {(() => {
											const planet = worldState.followedPlanetId
												? planetRegistry.get(worldState.followedPlanetId)
												: undefined;
											return planet ? (
												<>
													{planet.name}
													<br />
													(ID: {worldState.followedPlanetId})
												</>
											) : (
												"Unknown"
											);
										})()}
									</span>
									<button
										type="button"
										onClick={() => {
											simulationWorld.setFollowedPlanetId(null);
											syncWorld();
										}}
										className="cursor-pointer rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-200 hover:bg-blue-500/40"
									>
										解除
									</button>
								</div>
							</div>
						)}

						<strong>追加済み惑星 ({worldState.planetIds.length})</strong>
						<ul className="mb-0 mt-2.5 list-none p-0">
							{panelPlanets.map(({ planetId, planet }) => (
								<li
									key={`planet-item-${planetId}`}
									className="mb-2 flex items-center justify-between gap-2 border-b border-white/15 pb-2"
								>
									<div>
										<div>{planet.name}</div>
										<div className="text-xs opacity-[0.85]">
											r={planet.radius.toFixed(1)} / (
											{planet.position.x.toFixed(1)},
											{planet.position.y.toFixed(1)},{" "}
											{planet.position.z.toFixed(1)})
										</div>
									</div>
									<div className="flex shrink-0 items-center gap-2">
										{worldState.followedPlanetId === planetId ? (
											<span className="px-2 py-1 text-xs text-blue-300">
												追尾中
											</span>
										) : (
											<button
												type="button"
												onClick={() => {
													simulationWorld.setFollowedPlanetId(planetId);
													syncWorld();
												}}
												className="cursor-pointer rounded-md border border-white/40 bg-transparent px-2 py-1 text-xs text-white"
											>
												追尾
											</button>
										)}
										<button
											type="button"
											onClick={() => removePlanet(planetId)}
											className="cursor-pointer rounded-md border border-white/40 bg-transparent px-2 py-1 text-xs text-white"
										>
											削除
										</button>
									</div>
								</li>
							))}
						</ul>
					</>
				)}
			</div>
		</div>
	);
}
