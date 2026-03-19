import { Physics } from "@react-three/cannon";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { button, useControls } from "leva";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as Controls } from "three-stdlib";
import { earth, jupiter, mars, sun, venus } from "@/data/planets";
import type { ExplosionData } from "@/types/Explosion";
import type { Planet } from "@/types/planet";
import { CameraController } from "./components/CameraController";
import { Explosion } from "./components/Explosion";
import { PlanetMesh } from "./components/PlanetMesh";
import {
	PlacementSurface,
	PreviewPlanet,
} from "./components/PlanetPlacementView";

const planetTexturePaths = [
	earth.texturePath,
	sun.texturePath,
	mars.texturePath,
	jupiter.texturePath,
	venus.texturePath,
];
useTexture.preload(planetTexturePaths);

const planetTemplates = { earth, sun, mars, jupiter, venus } as const;

function computeMass(radius: number, mass: number, newRadius: number) {
	const newMass = mass * (newRadius / radius) ** 3;
	return newMass;
}

export default function Page() {
	const orbitControlsRef = useRef<Controls | null>(null);
	const planetRegistry = useRef<
		Map<
			string,
			{
				mesh: THREE.Mesh;
				position: React.MutableRefObject<number[]>;
				velocity: React.MutableRefObject<number[]>;
			}
		>
	>(new Map());

	const [planets, setPlanets] = useState<Planet[]>([earth]);
	const [explosions, setExplosions] = useState<ExplosionData[]>([]);
	const [followedPlanetId, setFollowedPlanetId] = useState<string | null>(null);

	const [placementMode, setPlacementMode] = useState(false);
	const [placementPanelOpen, setPlacementPanelOpen] = useState(true);

	const [planetControls, setPlanetControls, getPlanetControl] = useControls(
		"New Planet",
		() => ({
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
					const template = planetTemplates[selectedType] ?? earth;
					setPlanetControls({
						radius: template.radius,
						rotationSpeedY: template.rotationSpeedY,
					});
				},
			},
			radius: { value: 1.2, min: 0.2, max: 6, step: 0.1 },
			posX: { value: 0, min: -200, max: 200, step: 0.2 },
			posY: { value: 0, min: -200, max: 200, step: 0.2 },
			posZ: { value: 0, min: -200, max: 200, step: 0.2 },
			rotationSpeedY: { value: 0.6, min: 0, max: 10, step: 0.1 },
			velX: { value: 0, min: -10, max: 10, step: 0.1 },
			velY: { value: 0, min: -10, max: 10, step: 0.1 },
			velZ: { value: 0, min: -10, max: 10, step: 0.1 },
		}),
	);

	useControls("New Planet", {
		addPlanet: button(() => {
			const selectedType =
				(getPlanetControl("planetType") as keyof typeof planetTemplates) ??
				"earth";
			const template = planetTemplates[selectedType] ?? earth;
			const settings = {
				radius: getPlanetControl("radius"),
				posX: getPlanetControl("posX"),
				posY: getPlanetControl("posY"),
				posZ: getPlanetControl("posZ"),
				rotationSpeedY: getPlanetControl("rotationSpeedY"),
				velX: getPlanetControl("velX"),
				velY: getPlanetControl("velY"),
				velZ: getPlanetControl("velZ"),
			};

			const newMass = computeMass(
				template.radius,
				template.mass,
				settings.radius,
			);

			setPlanets((prev) => [
				...prev,
				{
					id: crypto.randomUUID(),
					name: template.name,
					texturePath: template.texturePath,
					rotationSpeedY: settings.rotationSpeedY,
					radius: settings.radius,
					width: 64,
					height: 64,
					position: new THREE.Vector3(
						settings.posX,
						settings.posY,
						settings.posZ,
					),
					velocity: new THREE.Vector3(
						settings.velX,
						settings.velY,
						settings.velZ,
					),
					mass: newMass,
				},
			]);
		}),
	});

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

	const { timeScale } = useControls("Simulation", {
		timeScale: { value: 1, min: 0.1, max: 5, step: 0.1 },
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
		setPlanets((prev) => prev.filter((p) => p.id !== planetId));
		if (followedPlanetId === planetId) {
			setFollowedPlanetId(null);
		}
	};

	const updatePlanetRadius = (planetId: string, radius: number) => {
		const registryEntry = planetRegistry.current.get(planetId);
		const nextPosition = registryEntry?.position.current;
		const nextVelocity = registryEntry?.velocity.current;

		setPlanets((prev) =>
			prev.map((planet) => {
				if (planet.id !== planetId) return planet;

				return {
					...planet,
					radius,
					position: nextPosition
						? new THREE.Vector3(
								nextPosition[0],
								nextPosition[1],
								nextPosition[2],
							)
						: planet.position,
					velocity: nextVelocity
						? new THREE.Vector3(
								nextVelocity[0],
								nextVelocity[1],
								nextVelocity[2],
							)
						: planet.velocity,
				};
			}),
		);
	};

	const handleExplosion = (position: THREE.Vector3, radius: number) => {
		// 連続爆発を防ぐための簡易的なデバウンス処理などをここに追加しても良い
		setExplosions((prev) => {
			// 同じ場所での重複爆発を簡易的に防ぐ
			if (prev.some((e) => e.position.distanceTo(position) < 2)) return prev;

			return [
				...prev,
				{
					id: crypto.randomUUID(),
					radius: radius * 1.5,
					position: position.clone(),
					fragmentCount: 50,
				},
			];
		});
	};

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
					followedPlanetId={followedPlanetId}
					planetRegistry={planetRegistry}
					orbitControlsRef={orbitControlsRef}
				/>

				<Physics gravity={[0, 0, 0]}>
					{planets.map((planet) => (
						<Suspense key={`${planet.id}-${planet.radius}`} fallback={null}>
							<PlanetMesh
								planet={planet}
								planetRegistry={planetRegistry}
								onExplosion={handleExplosion}
								onSelect={(id) => setFollowedPlanetId(id)}
								timeScale={timeScale}
							/>
						</Suspense>
					))}
				</Physics>

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

				{explosions.map((exp) => (
					<Explosion key={exp.id} explosion={exp} timeScale={timeScale} />
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

						{followedPlanetId && (
							<div className="mb-3 mt-2 rounded border border-blue-500/30 bg-blue-500/10 p-2">
								<div className="flex items-center justify-between">
									<span className="text-blue-200">
										追尾中: {(() => {
											const planet = planets.find(
												(p) => p.id === followedPlanetId,
											);
											return planet ? (
												<>
													{planet.name}
													<br />
													(ID: {planet.id})
												</>
											) : (
												"Unknown"
											);
										})()}
									</span>
									<button
										type="button"
										onClick={() => setFollowedPlanetId(null)}
										className="cursor-pointer rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-200 hover:bg-blue-500/40"
									>
										解除
									</button>
								</div>
							</div>
						)}

						<strong>追加済み惑星 ({planets.length})</strong>
						<ul className="mb-0 mt-2.5 list-none p-0">
							{planets.map((planet) => (
								<li
									key={`planet-item-${planet.id}`}
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
										<div className="mt-2 flex items-center gap-2 text-xs">
											<label className="flex flex-1 items-center gap-2">
												半径
												<input
													type="range"
													min={0.2}
													max={20}
													step={0.1}
													value={planet.radius}
													onChange={(event) =>
														updatePlanetRadius(
															planet.id,
															Number(event.target.value),
														)
													}
												/>
											</label>
											<span className="w-10 text-right">
												{planet.radius.toFixed(1)}
											</span>
										</div>
									</div>
									<div className="flex shrink-0 items-center gap-2">
										{followedPlanetId === planet.id ? (
											<span className="px-2 py-1 text-xs text-blue-300">
												追尾中
											</span>
										) : (
											<button
												type="button"
												onClick={() => setFollowedPlanetId(planet.id)}
												className="cursor-pointer rounded-md border border-white/40 bg-transparent px-2 py-1 text-xs text-white"
											>
												追尾
											</button>
										)}
										<button
											type="button"
											onClick={() => removePlanet(planet.id)}
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
