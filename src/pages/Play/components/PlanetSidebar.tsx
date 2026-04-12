import type {
	PlanetRegistry,
	PlanetRegistryEntry,
} from "../core/PlanetRegistry";
import type { SimulationWorld } from "../core/SimulationWorld";
import type { StagedPlanet } from "../types/sidebar";
import { SidebarForm } from "./SidebarForm";
import { StagedList } from "./StagedList";

type PlanetSidebarProps = {
	worldState: ReturnType<SimulationWorld["getSnapshot"]>;
	planetRegistry: PlanetRegistry;
	simulationWorld: SimulationWorld;
	syncWorld: () => void;
	removePlanet: (planetId: string) => void;
	isOpen: boolean;
	setIsOpen: (v: boolean) => void;
	stagedPlanets: StagedPlanet[];
	form: StagedPlanet;
	setForm: (v: StagedPlanet | ((prev: StagedPlanet) => StagedPlanet)) => void;
	updateTemplate: (templateKey: string) => void;
	updatePosition: (axis: "posX" | "posY" | "posZ", value: number) => void;
	addToStaged: () => void;
	removeStaged: (stagedId: string) => void;
	clearAllStaged: () => void;
	onBatchPlace: () => void;
};

export function PlanetSidebar({
	worldState,
	planetRegistry,
	simulationWorld,
	syncWorld,
	removePlanet,
	isOpen,
	setIsOpen,
	stagedPlanets,
	form,
	updateTemplate,
	updatePosition,
	addToStaged,
	removeStaged,
	clearAllStaged,
	onBatchPlace,
	placementMode,
	setPlacementMode,
	setForm,
}: PlanetSidebarProps & {
	placementMode: boolean;
	setPlacementMode: (v: boolean) => void;
}) {
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

	return (
		<>
			{/* PlacementSurface is rendered in SimulationCanvas; we just pass placementMode via simulationCanvas props */}
			{/**
			 * We communicate placementMode back to the parent via a side-channel:
			 * SimulationCanvas already has a placementMode prop, so the parent can wire it.
			 * For now, the toggle lives here but we trigger placement through setPositionFromClick.
			 */}

			{/* Sidebar */}
			<div className="absolute right-0 top-0 flex h-screen">
				{/* Toggle button */}
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className="my-auto flex h-12 w-6 items-center justify-center rounded-l-md bg-black/60 text-white/70 backdrop-blur-sm transition-colors hover:bg-black/80 hover:text-white"
				>
					{isOpen ? "▶" : "◀"}
				</button>

				{/* Panel content */}
				{isOpen && (
					<div className="w-80 max-h-screen overflow-y-auto rounded-l-lg bg-black/80 p-4 text-sm text-white backdrop-blur-sm">
						<div className="mb-4">
							<strong className="text-base">惑星配置</strong>
						</div>

						{/* Placement mode toggle */}
						<div className="mb-4 flex items-center gap-2">
							<label className="flex items-center gap-1.5 text-xs">
								<input
									type="checkbox"
									checked={placementMode}
									onChange={(e) => setPlacementMode(e.target.checked)}
								/>
								配置モード（3D面をクリック）
							</label>
						</div>

						{/* Hidden input to communicate placementMode to parent */}
						<input
							type="hidden"
							data-placement-mode={placementMode}
							id="planet-placement-mode"
						/>

						{/* Form */}
						<SidebarForm
							form={form}
							placementMode={placementMode}
							onTemplateChange={updateTemplate}
							onRadiusChange={(v) =>
								setForm((prev: StagedPlanet) => ({ ...prev, radius: v }))
							}
							onRotationSpeedChange={(v) =>
								setForm((prev: StagedPlanet) => ({
									...prev,
									rotationSpeedY: v,
								}))
							}
							onPositionChange={updatePosition}
							onAddToStaged={addToStaged}
						/>

						{/* Staged planets */}
						<StagedList
							stagedPlanets={stagedPlanets}
							onRemove={removeStaged}
							onClearAll={clearAllStaged}
							onBatchPlace={onBatchPlace}
						/>

						{/* Followed planet info */}
						{worldState.followedPlanetId && (
							<div className="mt-3 rounded border border-blue-500/30 bg-blue-500/10 p-2 text-xs">
								<div className="flex items-center justify-between">
									<span className="text-blue-200">
										追尾中: {(() => {
											const planet = worldState.followedPlanetId
												? planetRegistry.get(worldState.followedPlanetId)
												: undefined;
											return planet ? planet.name : "Unknown";
										})()}
									</span>
									<button
										type="button"
										onClick={() => {
											simulationWorld.setFollowedPlanetId(null);
											syncWorld();
										}}
										className="rounded bg-blue-500/20 px-2 py-0.5 text-blue-200 hover:bg-blue-500/40"
									>
										解除
									</button>
								</div>
							</div>
						)}

						{/* Placed planets list */}
						<div className="mt-4 border-t border-white/15 pt-3">
							<strong className="text-xs">
								追加済み惑星 ({worldState.planetIds.length})
							</strong>
							<ul className="mt-2 list-none space-y-1.5 p-0">
								{panelPlanets.map(({ planetId, planet }) => (
									<li
										key={`planet-item-${planetId}`}
										className="flex items-center justify-between gap-2 border-b border-white/15 pb-1.5 text-xs"
									>
										<div>
											<div className="font-medium">{planet.name}</div>
											<div className="opacity-70">
												r={planet.radius.toFixed(1)} / (
												{planet.position.x.toFixed(1)},{" "}
												{planet.position.y.toFixed(1)},{" "}
												{planet.position.z.toFixed(1)})
											</div>
										</div>
										<div className="flex shrink-0 items-center gap-1.5">
											{worldState.followedPlanetId === planetId ? (
												<span className="text-blue-300">追尾中</span>
											) : (
												<button
													type="button"
													onClick={() => {
														simulationWorld.setFollowedPlanetId(planetId);
														syncWorld();
													}}
													className="rounded border border-white/30 bg-transparent px-1.5 py-0.5 text-white/80 hover:bg-white/10"
												>
													追尾
												</button>
											)}
											<button
												type="button"
												onClick={() => removePlanet(planetId)}
												className="rounded border border-white/30 bg-transparent px-1.5 py-0.5 text-white/80 hover:bg-white/10"
											>
												削除
											</button>
										</div>
									</li>
								))}
							</ul>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
