import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Explosion } from "@/components/Explosion";
import { earth, jupiter, mars, sun, venus } from "@/data/planets";
import type { ExplosionData } from "@/types/Explosion";
import type { Planet } from "@/types/planet";
import { isColliding } from "@/utils/isColliding";

const planetTexturePaths = [
	earth.texturePath,
	sun.texturePath,
	mars.texturePath,
	jupiter.texturePath,
	venus.texturePath,
];
useTexture.preload(planetTexturePaths);

type PlanetMeshProps = {
	planet: Planet;
};

function PlanetMesh({ planet }: PlanetMeshProps) {
	const meshRef = useRef<THREE.Mesh>(null);

	// Load the texture (you can use any public Earth texture URL)
	const [colorMap] = useTexture([planet.texturePath]);

	// This hook runs every frame (approx 60fps)
	useFrame((_state, delta) => {
		if (meshRef.current) {
			// Rotate the planet on its Y-axis
			meshRef.current.rotation.y += delta * planet.rotationSpeedY;
			// 位置を planet.position に同期
			meshRef.current.position.set(
				planet.position.x,
				planet.position.y,
				planet.position.z,
			);
		}
	});

	return (
		<mesh
			ref={meshRef}
			position={[planet.position.x, planet.position.y, planet.position.z]}
		>
			{/* args: [radius, widthSegments, heightSegments]
        Higher segments = smoother sphere
      */}
			<sphereGeometry args={[planet.radius, planet.width, planet.height]} />
			<meshStandardMaterial map={colorMap} />
		</mesh>
	);
}

type PreviewPlanetProps = {
	radius: number;
	position: [number, number, number];
};
// 惑星の配置プレビュー用の半透明の球体を描画するコンポーネント
function PreviewPlanet({ radius, position }: PreviewPlanetProps) {
	return (
		<mesh position={position}>
			<sphereGeometry args={[radius, 24, 24]} />
			<meshBasicMaterial color="#6ee7ff" wireframe opacity={0.6} transparent />
		</mesh>
	);
}

type PlacementSurfaceProps = {
	enabled: boolean;
	yLevel: number;
	onPlace: (position: [number, number, number]) => void;
};
// 惑星の配置を行うための透明な平面を描画するコンポーネント
function PlacementSurface({ enabled, yLevel, onPlace }: PlacementSurfaceProps) {
	const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
		if (!enabled) {
			return;
		}

		event.stopPropagation();
		const { x, y, z } = event.point;
		const step = 0.2;
		const round = (value: number) => Math.round(value / step) * step;
		onPlace([round(x), round(y), round(z)]);
	};

	return (
		<mesh
			position={[0, yLevel, 0]}
			rotation={[-Math.PI / 2, 0, 0]}
			onPointerDown={handlePointerDown}
		>
			<planeGeometry args={[400, 400]} />
			<meshBasicMaterial
				color="#6ee7ff"
				opacity={enabled ? 0.14 : 0}
				transparent
				depthWrite={false}
				side={THREE.DoubleSide}
			/>
		</mesh>
	);
}

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
			},
			radius: { value: 1.2, min: 0.2, max: 6, step: 0.1 },
			posX: { value: 0, min: -200, max: 200, step: 0.2 },
			posY: { value: 0, min: -200, max: 200, step: 0.2 },
			posZ: { value: 0, min: -200, max: 200, step: 0.2 },
			rotationSpeedY: { value: 0.6, min: 0, max: 10, step: 0.1 },
		}),
	);

	useEffect(() => {
		const selectedType =
			(planetControls.planetType as keyof typeof planetTemplates) ?? "earth";
		const template = planetTemplates[selectedType] ?? earth;
		setPlanetControls({
			radius: template.radius,
			rotationSpeedY: template.rotationSpeedY,
		});
	}, [planetControls.planetType, setPlanetControls]);

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
				<OrbitControls enableZoom={true} />
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
