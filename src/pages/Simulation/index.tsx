import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as Controls } from "three-stdlib";
import { earth, jupiter, mars, sun, venus } from "@/data/planets";
import type { ExplosionData } from "@/types/Explosion";
import type { Planet } from "@/types/planet";
import { isColliding } from "@/utils/isColliding";
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

type SimulationProps = {
	planets: Planet[];
	onExplosion: (newExp: ExplosionData) => void;
};

export function Simulation({ planets, onExplosion }: SimulationProps) {
	// 前フレームの衝突ペアを記録して、連続爆発を防ぐ
	const collidedPairsRef = useRef<Set<string>>(new Set());

	useFrame((_state, delta) => {
		// 並進運動
		for (let i = 0; i < planets.length; i++) {
			if (planets[i].velocity) {
				planets[i].position.addScaledVector(planets[i].velocity, delta);
			}
		}

		// 衝突判定
		for (let i = 0; i < planets.length; i++) {
			for (let j = i + 1; j < planets.length; j++) {
				const a = planets[i];
				const b = planets[j];
				const key = `${i}-${j}`;

				if (isColliding(a, b)) {
					if (!collidedPairsRef.current.has(key)) {
						collidedPairsRef.current.add(key);

						// 衝突したら爆発を追加
						const newExp = {
							id: crypto.randomUUID(),
							radius: (a.radius + b.radius) / 2,
							position: a.position.clone().lerp(b.position, 0.5),
							fragmentCount: 50,
						};
						onExplosion(newExp);

						console.log(`Collision detected between planet ${i} and ${j}`);
					}
				} else {
					// 衝突していない場合は記録を削除
					collidedPairsRef.current.delete(key);
				}
			}
		}
	});

	return null;
}

export default function Page() {
	const orbitControlsRef = useRef<Controls | null>(null);

	const [planets, setPlanets] = useState<Planet[]>([earth]);
	const [explosions, setExplosions] = useState<ExplosionData[]>([]);

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
			};

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
					velocity: new THREE.Vector3(0, 0, 0),
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

	const removePlanet = (planetIndex: number) => {
		setPlanets((prev) => prev.filter((_, index) => index !== planetIndex));
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

				{planets.map((planet) => (
					<PlanetMesh key={planet.id} planet={planet} />
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
				<Simulation
					planets={planets}
					onExplosion={(newExp: ExplosionData) =>
						setExplosions((prev) => [...prev, newExp])
					}
				/>
				{explosions.map((exp) => (
					<Explosion key={exp.id} explosion={exp} />
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
									</div>
									<button
										type="button"
										onClick={() =>
											removePlanet(planets.findIndex((p) => p.id === planet.id))
										}
										className="cursor-pointer rounded-md border border-white/40 bg-transparent px-2 py-1 text-white"
									>
										削除
									</button>
								</li>
							))}
						</ul>
					</>
				)}
			</div>
		</div>
	);
}
