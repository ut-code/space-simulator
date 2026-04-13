import type { OrbitControls as Controls } from "three-stdlib";
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
	updatePlanetRadius: (planetId: string, radius: number) => void;
	isOpen: boolean;
	setIsOpen: (v: boolean) => void;
	stagedPlanets: StagedPlanet[];
	form: StagedPlanet;
	setForm: (v: StagedPlanet | ((prev: StagedPlanet) => StagedPlanet)) => void;
	updateTemplate: (templateKey: string) => void;
	updatePosition: (axis: "posX" | "posY" | "posZ", value: number) => void;
	updateVelocity: (axis: "velX" | "velY" | "velZ", value: number) => void;
	toggleAutoKind: (enabled: boolean) => void;
	addToStaged: () => void;
	removeStaged: (stagedId: string) => void;
	clearAllStaged: () => void;
	onBatchPlace: () => void;
	showGrid: boolean;
	setShowGrid: (v: boolean) => void;
	showAxes: boolean;
	setShowAxes: (v: boolean) => void;
	showPreview: boolean;
	setShowPreview: (v: boolean) => void;
	orbitControlsRef: React.RefObject<Controls | null>;
};

export function PlanetSidebar({
	worldState,
	planetRegistry,
	simulationWorld,
	syncWorld,
	removePlanet,
	updatePlanetRadius,
	isOpen,
	setIsOpen,
	stagedPlanets,
	form,
	updateTemplate,
	updatePosition,
	updateVelocity,
	toggleAutoKind,
	addToStaged,
	removeStaged,
	clearAllStaged,
	onBatchPlace,
	placementMode,
	setPlacementMode,
	setForm,
	showGrid,
	setShowGrid,
	showAxes,
	setShowAxes,
	showPreview,
	setShowPreview,
	orbitControlsRef,
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
							<strong className="text-base">惑星を追加する</strong>
						</div>

						{/* Form */}
						<SidebarForm
							form={form}
							placementMode={placementMode}
							onPlacementModeChange={setPlacementMode}
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
							onVelocityChange={updateVelocity}
							onAutoKindToggle={toggleAutoKind}
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
							<ul className="mt-2 list-none space-y-2 p-0">
								{panelPlanets.map(({ planetId, planet }) => (
									<li
										key={`planet-item-${planetId}`}
										className="rounded border border-white/10 bg-white/5 px-2 py-1.5 text-xs"
									>
										<div className="flex items-center justify-between gap-2">
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
										</div>
										{/* Radius slider */}
										<div className="mt-1 px-1 py-0.5 opacity-75">
											<div className="mb-0.5 flex items-center justify-between text-[11px] text-cyan-100/80">
												<span>半径</span>
												<span>{planet.radius.toFixed(1)}</span>
											</div>
											<input
												type="range"
												min={0.2}
												max={12}
												step={0.1}
												value={planet.radius}
												onChange={(event) =>
													updatePlanetRadius(
														planetId,
														Number(event.target.value),
													)
												}
												className="mx-auto block h-1 w-[86%] cursor-pointer accent-cyan-200/70"
											/>
										</div>
									</li>
								))}
							</ul>
						</div>

						{/* Helpers section */}
						<div className="mt-4 border-t border-white/15 pt-3">
							<strong className="text-xs">Helpers</strong>
							<div className="mt-2 space-y-1.5">
								<label className="flex cursor-pointer items-center gap-2 text-xs">
									<input
										type="checkbox"
										checked={showGrid}
										onChange={(e) => setShowGrid(e.target.checked)}
									/>
									グリッド
								</label>
								<label className="flex cursor-pointer items-center gap-2 text-xs">
									<input
										type="checkbox"
										checked={showAxes}
										onChange={(e) => setShowAxes(e.target.checked)}
									/>
									軸ヘルパー
								</label>
								<label className="flex cursor-pointer items-center gap-2 text-xs">
									<input
										type="checkbox"
										checked={showPreview}
										onChange={(e) => setShowPreview(e.target.checked)}
									/>
									配置プレビュー
								</label>
								<button
									type="button"
									onClick={() => {
										if (orbitControlsRef.current) {
											orbitControlsRef.current.reset();
											orbitControlsRef.current.target.set(0, 0, 0);
											orbitControlsRef.current.update();
										}
									}}
									className="mt-1 w-full rounded border border-white/30 bg-transparent px-2 py-1 text-xs text-white/80 hover:bg-white/10"
								>
									カメラリセット
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
