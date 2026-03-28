import { useState } from "react";
import type {
	PlanetRegistry,
	PlanetRegistryEntry,
} from "../core/PlanetRegistry";
import type { SimulationWorld } from "../core/SimulationWorld";

interface PlacementPanelProps {
	worldState: ReturnType<SimulationWorld["getSnapshot"]>;
	planetRegistry: PlanetRegistry;
	simulationWorld: SimulationWorld;
	syncWorld: () => void;
	removePlanet: (planetId: string) => void;
	placementMode: boolean;
	setPlacementMode: (value: boolean) => void;
}

type PanelPlanet = { planetId: string; planet: PlanetRegistryEntry };

export function PlacementPanel({
	worldState,
	planetRegistry,
	simulationWorld,
	syncWorld,
	removePlanet,
	placementMode,
	setPlacementMode,
}: PlacementPanelProps) {
	const [panelOpen, setPanelOpen] = useState(true);

	const panelPlanets = worldState.planetIds
		.map((planetId) => {
			const planet = planetRegistry.get(planetId);
			if (!planet) return null;
			return { planetId, planet };
		})
		.filter((item): item is PanelPlanet => item !== null);

	return (
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
						onClick={() => setPanelOpen((prev) => !prev)}
						className="cursor-pointer rounded-md border border-white/40 bg-transparent px-2 py-0.5 text-xs text-white"
					>
						{panelOpen ? "たたむ" : "ひらく"}
					</button>
				</div>
			</div>
			{panelOpen && (
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
	);
}
