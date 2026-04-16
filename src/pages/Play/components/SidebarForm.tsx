import { Switch } from "@/components/ui/switch";
import { earth, jupiter, mars, sun, venus } from "@/data/planets";
import type { StagedPlanet } from "../types/sidebar";

type SidebarFormProps = {
	form: StagedPlanet;
	placementMode: boolean;
	onPlacementModeChange: (value: boolean) => void;
	onTemplateChange: (templateKey: string) => void;
	onRadiusChange: (value: number) => void;
	onMassChange: (value: number) => void;
	onRotationSpeedChange: (value: number) => void;
	onPositionChange: (axis: "posX" | "posY" | "posZ", value: number) => void;
	onVelocityChange: (axis: "velX" | "velY" | "velZ", value: number) => void;
	onAutoKindToggle: (enabled: boolean) => void;
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
	onPlacementModeChange,
	onTemplateChange,
	onRadiusChange,
	onMassChange,
	onRotationSpeedChange,
	onPositionChange,
	onVelocityChange,
	onAutoKindToggle,
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

			{/* Mass */}
			<div>
				<label htmlFor="planet-mass" className="mb-1 block text-xs opacity-80">
					質量: {form.mass.toFixed(1)}
				</label>
				<input
					id="planet-mass"
					type="range"
					min={0.1}
					max={30000}
					step={0.1}
					value={form.mass}
					onChange={(e) => onMassChange(Number(e.target.value))}
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
				<div className="mb-1 flex items-center justify-between">
					<span className="text-xs opacity-80">位置</span>
					<div className="flex items-center justify-between text-xs gap-2">
						{placementMode ? "3D面をクリックして位置を指定" : "3D面で配置"}
						<Switch
							checked={placementMode}
							onCheckedChange={onPlacementModeChange}
							className="data-[state=checked]:bg-cyan-500 data-[state=unchecked]:bg-gray-600"
						/>
					</div>
				</div>
				<div className="grid grid-cols-3 gap-1.5">
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

			{/* Velocity */}
			<div>
				<span className="mb-1 block text-xs opacity-80">速度</span>
				<div className="grid grid-cols-3 gap-2">
					{(["velX", "velY", "velZ"] as const).map((axis, idx) => {
						const label = axis.replace("vel", "");
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
									min={-20}
									max={20}
									step={0.1}
									value={form.velocity[idx]}
									onChange={(e) =>
										onVelocityChange(axis, Number(e.target.value))
									}
									className="mt-0.5 w-full rounded border border-white/20 bg-white/5 px-2 py-1 text-sm text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
							</div>
						);
					})}
				</div>
			</div>

			{/* Auto texture toggle */}
			<div className="flex items-center gap-2">
				<div className="flex items-center justify-between text-xs gap-1.5">
					<Switch
						checked={form.autoKindAssignment}
						onCheckedChange={onAutoKindToggle}
						className="data-[state=checked]:bg-cyan-500 data-[state=unchecked]:bg-gray-600"
					/>
					<span className="text-white/80">自動テクスチャ</span>
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
