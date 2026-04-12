import { earth, jupiter, mars, sun, venus } from "@/data/planets";
import type { StagedPlanet } from "../types/sidebar";

type SidebarFormProps = {
	form: StagedPlanet;
	placementMode: boolean;
	onTemplateChange: (templateKey: string) => void;
	onRadiusChange: (value: number) => void;
	onRotationSpeedChange: (value: number) => void;
	onPositionChange: (axis: "posX" | "posY" | "posZ", value: number) => void;
	onAddToStaged: () => void;
};

const planetTemplates = {
	earth,
	sun,
	mars,
	jupiter,
	venus,
};

export function SidebarForm({
	form,
	placementMode,
	onTemplateChange,
	onRadiusChange,
	onRotationSpeedChange,
	onPositionChange,
	onAddToStaged,
}: SidebarFormProps) {
	return (
		<div className="space-y-3">
			{/* Planet type selector */}
			<div>
				<span className="mb-1 block text-xs opacity-80">惑星タイプ</span>
				<div className="flex flex-wrap gap-1.5">
					{Object.entries(planetTemplates).map(([key, tpl]) => (
						<button
							key={key}
							type="button"
							onClick={() => onTemplateChange(key)}
							aria-pressed={form.templateKey === key}
							className={`rounded-md border px-2.5 py-1 text-xs capitalize transition-colors ${
								form.templateKey === key
									? "border-cyan-400 bg-cyan-400/20 text-cyan-200"
									: "border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:bg-white/10"
							}`}
						>
							{tpl.name}
						</button>
					))}
				</div>
			</div>

			{/* Radius */}
			<div>
				<label
					htmlFor="planet-radius"
					className="mb-1 block text-xs opacity-80"
				>
					半径: {form.radius.toFixed(1)}
				</label>
				<input
					id="planet-radius"
					type="range"
					min={0.2}
					max={6}
					step={0.1}
					value={form.radius}
					onChange={(e) => onRadiusChange(Number(e.target.value))}
					className="w-full"
				/>
			</div>

			{/* Rotation Speed */}
			<div>
				<label
					htmlFor="planet-rotation"
					className="mb-1 block text-xs opacity-80"
				>
					自転速度: {form.rotationSpeedY.toFixed(1)}
				</label>
				<input
					id="planet-rotation"
					type="range"
					min={0}
					max={10}
					step={0.1}
					value={form.rotationSpeedY}
					onChange={(e) => onRotationSpeedChange(Number(e.target.value))}
					className="w-full"
				/>
			</div>

			{/* Position */}
			<div>
				<span className="mb-1 block text-xs opacity-80">
					位置{" "}
					{placementMode && (
						<span className="text-cyan-300">(配置モード: 3D面をクリック)</span>
					)}
				</span>
				<div className="grid grid-cols-3 gap-2">
					{(["posX", "posY", "posZ"] as const).map((axis, idx) => {
						const label = axis.replace("pos", "");
						return (
							<div key={axis}>
								<label
									htmlFor={`planet-${axis}`}
									className="text-xs opacity-60"
								>
									{label}
								</label>
								<input
									id={`planet-${axis}`}
									type="number"
									min={-200}
									max={200}
									step={0.2}
									value={form.position[idx]}
									onChange={(e) =>
										onPositionChange(axis, Number(e.target.value))
									}
									className="mt-0.5 w-full rounded border border-white/20 bg-white/5 px-2 py-1 text-sm text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
							</div>
						);
					})}
				</div>
			</div>

			{/* Add button */}
			<button
				type="button"
				onClick={onAddToStaged}
				className="w-full rounded-md bg-cyan-500/80 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-500"
			>
				配置待ちリストに追加
			</button>
		</div>
	);
}
