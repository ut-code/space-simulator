import type { StagedPlanet } from "../types/sidebar";

type StagedListProps = {
	stagedPlanets: StagedPlanet[];
	onRemove: (stagedId: string) => void;
	onClearAll: () => void;
	onBatchPlace: () => void;
};

export function StagedList({
	stagedPlanets,
	onRemove,
	onClearAll,
	onBatchPlace,
}: StagedListProps) {
	if (stagedPlanets.length === 0) return null;

	return (
		<div className="mt-3 border-t border-white/15 pt-3">
			<div className="mb-2 flex items-center justify-between">
				<strong className="text-xs">配置待ち ({stagedPlanets.length})</strong>
				<div className="flex gap-1.5">
					<button
						type="button"
						onClick={onBatchPlace}
						className="cursor-pointer rounded border border-green-400/30 bg-green-400/20 px-2 py-0.5 text-xs text-green-300 hover:bg-green-400/30"
					>
						一括配置
					</button>
					<button
						type="button"
						onClick={onClearAll}
						className="cursor-pointer rounded border border-red-400/30 bg-red-400/10 px-2 py-0.5 text-xs text-red-300 hover:bg-red-400/20"
					>
						全削除
					</button>
				</div>
			</div>
			<ul className="list-none space-y-1.5 p-0">
				{stagedPlanets.map((staged) => (
					<li
						key={staged.id}
						className="flex items-center justify-between gap-2 rounded border border-white/10 bg-white/5 px-2 py-1.5 text-xs"
					>
						<div>
							<span className="font-medium">{staged.name}</span>
							<span className="ml-1.5 opacity-60">
								r={staged.radius.toFixed(1)}
							</span>
						</div>
						<button
							type="button"
							onClick={() => onRemove(staged.id)}
							className="rounded px-1.5 py-0.5 text-white/70 hover:bg-white/10 hover:text-white"
						>
							✕
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
