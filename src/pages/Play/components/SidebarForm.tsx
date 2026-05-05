import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
	earth,
	jupiter,
	mars,
	mercury,
	moon,
	neptune,
	saturn,
	sun,
	uranus,
	venus,
} from "@/data/planets";
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
	sun,
	moon,
	mercury,
	venus,
	earth,
	mars,
	jupiter,
	saturn,
	uranus,
	neptune,
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
	const [radiusInput, setRadiusInput] = useState<string>(String(form.radius));
	const [massInput, setMassInput] = useState<string>(String(form.mass));
	const [rotationSpeedYInput, setRotationSpeedYInput] = useState<string>(
		String(form.rotationSpeedY),
	);
	const [position, setPosition] = useState<[string, string, string]>([
		String(form.position[0]),
		String(form.position[1]),
		String(form.position[2]),
	]);
	const [velocity, setVelocity] = useState<[string, string, string]>([
		String(form.velocity[0]),
		String(form.velocity[1]),
		String(form.velocity[2]),
	]);
	const [propertyErrors, setPropertyErrors] = useState({
		radius: null as string | null,
		mass: null as string | null,
		rotation: null as string | null,
	});
	const [stateErrors, setStateErrors] = useState({
		position: [null, null, null] as (string | null)[],
		velocity: [null, null, null] as (string | null)[],
	});

	useEffect(() => {
		setRadiusInput(String(form.radius));
	}, [form.radius]);

	useEffect(() => {
		setMassInput(String(form.mass));
	}, [form.mass]);

	useEffect(() => {
		setRotationSpeedYInput(String(form.rotationSpeedY));
	}, [form.rotationSpeedY]);

	// useEffect(() => {
	// 	setPosition([
	// 		String(form.position[0]),
	// 		String(form.position[1]),
	// 		String(form.position[2]),
	// 	]);
	// }, [form.position]);

	function setPropertyError(
		key: "radius" | "mass" | "rotation",
		message: string | null,
	) {
		setPropertyErrors((prev) => ({
			...prev,
			[key]: message,
		}));
	}

	function setPositionError(idx: number, message: string | null) {
		setStateErrors((prev) => {
			const newErrors = [...prev.position];
			newErrors[idx] = message;
			return { ...prev, position: newErrors };
		});
	}

	function setVelocityError(idx: number, message: string | null) {
		setStateErrors((prev) => {
			const newErrors = [...prev.velocity];
			newErrors[idx] = message;
			return { ...prev, velocity: newErrors };
		});
	}

	const canAdd =
		!Object.values(propertyErrors).some((e) => e !== null) &&
		!stateErrors.position.some((e) => e !== null) &&
		!stateErrors.velocity.some((e) => e !== null);

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
							className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
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
			<div className="border-t border-white/60" />

			{/* Radius */}
			<div>
				<div className="flex items-center justify-between">
					<label
						htmlFor="planet-radius"
						className="mb-1 block text-xs opacity-80"
					>
						半径: {form.radius.toFixed(1)}
					</label>
					<input
						type="text"
						value={radiusInput}
						onChange={(e) => setRadiusInput(e.target.value)}
						onBlur={() => {
							const val = radiusInput.trim();
							if (val === "") {
								setRadiusInput(String(form.radius));
								setPropertyError("radius", null);
								return;
							}
							const num = Number(val);
							if (!Number.isNaN(num)) {
								if (0.2 <= num && num <= 50) {
									onRadiusChange(num);
									setRadiusInput(String(num));
									setPropertyError("radius", null);
								} else {
									setPropertyError("radius", "範囲内の数値を入力してください");
								}
							} else {
								setPropertyError("radius", "数値を入力してください");
							}
						}}
						className="w-20 text-left rounded border border-white/20 bg-white/5 px-2 py-1 text-sm text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
					/>
				</div>
				<input
					id="planet-radius"
					type="range"
					min={0.2}
					max={50}
					step={0.1}
					value={form.radius}
					onChange={(e) => {
						const val = Number(e.target.value);
						onRadiusChange(val);
						setPropertyError("radius", null);
					}}
					className="w-full"
				/>
			</div>

			{/* Mass */}
			<div>
				<div className="flex items-center justify-between">
					<label
						htmlFor="planet-mass"
						className="mb-1 block text-xs opacity-80"
					>
						質量: {form.mass.toFixed(1)}
					</label>
					<input
						type="text"
						value={massInput}
						onChange={(e) => setMassInput(e.target.value)}
						onBlur={() => {
							const val = massInput.trim();
							if (val === "") {
								setMassInput(String(form.mass));
								setPropertyError("mass", null);
								return;
							}
							const num = Number(val);
							if (!Number.isNaN(num)) {
								if (0.1 <= num && num <= 500000) {
									onMassChange(num);
									setMassInput(String(num));
									setPropertyError("mass", null);
								} else {
									setPropertyError("mass", "範囲内の数値を入力してください");
								}
							} else {
								setPropertyError("mass", "数値を入力してください");
							}
						}}
						className="w-20 text-left rounded border border-white/20 bg-white/5 px-2 py-1 text-sm text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
					/>
				</div>
				<input
					id="planet-mass"
					type="range"
					min={0.1}
					max={500000}
					step={0.1}
					value={form.mass}
					onChange={(e) => {
						const val = Number(e.target.value);
						onMassChange(val);
						setPropertyError("mass", null);
					}}
					className="w-full"
				/>
			</div>

			{/* Rotation Speed */}
			<div>
				<div className="flex items-center justify-between">
					<label
						htmlFor="planet-rotation"
						className="mb-1 block text-xs opacity-80"
					>
						自転速度: {form.rotationSpeedY.toFixed(2)}
					</label>
					<input
						type="text"
						value={rotationSpeedYInput}
						onChange={(e) => setRotationSpeedYInput(e.target.value)}
						onBlur={() => {
							const val = rotationSpeedYInput.trim();
							if (val === "") {
								setRotationSpeedYInput(String(form.rotationSpeedY));
								setPropertyError("rotation", null);
								return;
							}
							const num = Number(val);
							if (!Number.isNaN(num)) {
								if (-10 <= num && num <= 10) {
									onRotationSpeedChange(num);
									setRotationSpeedYInput(String(num));
									setPropertyError("rotation", null);
								} else {
									setPropertyError(
										"rotation",
										"範囲内の数値を入力してください",
									);
								}
							} else {
								setPropertyError("rotation", "数値を入力してください");
							}
						}}
						className="w-20 text-left rounded border border-white/20 bg-white/5 px-2 py-1 text-sm text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
					/>
				</div>
				<input
					id="planet-rotation"
					type="range"
					min={-10}
					max={10}
					step={0.01}
					value={form.rotationSpeedY}
					onChange={(e) => {
						const val = Number(e.target.value);
						onRotationSpeedChange(val);
						setPropertyError("rotation", null);
					}}
					className="w-full"
				/>
			</div>
			<div>
				{propertyErrors.radius && (
					<p className="text-red-400 text-xs mt-1">
						半径 : {propertyErrors.radius}
					</p>
				)}
			</div>
			<div>
				{propertyErrors.mass && (
					<p className="text-red-400 text-xs mt-1">
						質量 : {propertyErrors.mass}
					</p>
				)}
			</div>
			<div>
				{propertyErrors.rotation && (
					<p className="text-red-400 text-xs mt-1">
						自転速度 : {propertyErrors.rotation}
					</p>
				)}
			</div>

			<div className="border-t border-white/60" />
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
									type="text"
									value={position[idx]}
									onBlur={() => {
										const val = position[idx].trim();
										if (val === "") {
											onPositionChange(axis, 0);
											setPosition((prev) => {
												const newPos = [...prev] as [string, string, string];
												newPos[idx] = String(0);
												return newPos;
											});
											setPositionError(idx, null);
											return;
										}
										const num = Number(val);
										if (!Number.isNaN(num)) {
											onPositionChange(axis, num);
											setPosition((prev) => {
												const newPos = [...prev] as [string, string, string];
												newPos[idx] = String(num);
												return newPos;
											});
											setPositionError(idx, null);
										} else {
											setPositionError(idx, "数値を入力してください");
										}
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											const val = position[idx].trim();
											if (val === "") {
												onPositionChange(axis, 0);
												setPosition((prev) => {
													const newPos = [...prev] as [string, string, string];
													newPos[idx] = String(0);
													return newPos;
												});
												setPositionError(idx, null);
												return;
											}
											const num = Number(val);
											if (!Number.isNaN(num)) {
												onPositionChange(axis, num);
												setPosition((prev) => {
													const newPos = [...prev] as [string, string, string];
													newPos[idx] = String(num);
													return newPos;
												});
												setPositionError(idx, null);
											} else {
												setPositionError(idx, "数値を入力してください");
											}
										}
									}}
									onChange={(e) => {
										setPosition((prev) => {
											const newPos = [...prev] as [string, string, string];
											newPos[idx] = e.target.value;
											return newPos;
										});
									}}
									className="mt-0.5 w-full rounded border border-white/20 bg-white/5 px-2 py-1 text-sm text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
							</div>
						);
					})}
				</div>
				<ul className="text-red-400 text-xs mt-2 space-y-1">
					{stateErrors.position.map((err, i) =>
						err ? (
							<li key={`pos-${"XYZ"[i]}`}>
								pos{"XYZ"[i]}: {err}
							</li>
						) : null,
					)}
				</ul>
			</div>

			<div className="border-t border-white/60" />
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
									type="text"
									value={velocity[idx]}
									onBlur={() => {
										const val = velocity[idx].trim();
										if (val === "") {
											onVelocityChange(axis, 0);
											setVelocity((prev) => {
												const newVel = [...prev] as [string, string, string];
												newVel[idx] = String(0);
												return newVel;
											});
											setVelocityError(idx, null);
											return;
										}
										const num = Number(val);
										if (!Number.isNaN(num)) {
											onVelocityChange(axis, num);
											setVelocity((prev) => {
												const newVel = [...prev] as [string, string, string];
												newVel[idx] = String(num);
												return newVel;
											});
											setVelocityError(idx, null);
										} else {
											setVelocityError(idx, "数値を入力してください");
										}
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											const val = velocity[idx].trim();
											if (val === "") {
												onVelocityChange(axis, 0);
												setVelocity((prev) => {
													const newVel = [...prev] as [string, string, string];
													newVel[idx] = String(0);
													return newVel;
												});
												setVelocityError(idx, null);
												return;
											}
											const num = Number(val);
											if (!Number.isNaN(num)) {
												onVelocityChange(axis, num);
												setVelocity((prev) => {
													const newVel = [...prev] as [string, string, string];
													newVel[idx] = String(num);
													return newVel;
												});
												setVelocityError(idx, null);
											} else {
												setVelocityError(idx, "数値を入力してください");
											}
										}
									}}
									onChange={(e) => {
										setVelocity((prev) => {
											const newVel = [...prev] as [string, string, string];
											newVel[idx] = e.target.value;
											return newVel;
										});
									}}
									className="mt-0.5 w-full rounded border border-white/20 bg-white/5 px-2 py-1 text-sm text-white [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
							</div>
						);
					})}
				</div>
				<ul className="text-red-400 text-xs mt-2 space-y-1">
					{stateErrors.velocity.map((err, i) =>
						err ? (
							<li key={`vel-${"XYZ"[i]}`}>
								vel{"XYZ"[i]}: {err}
							</li>
						) : null,
					)}
				</ul>
			</div>

			<div className="border-t border-white/60" />
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
				disabled={!canAdd}
				className={`
				w-full rounded-md px-3 py-2 text-sm font-semibold text-white transition-colors
				${
					canAdd
						? "bg-cyan-500/80 hover:bg-cyan-500"
						: "bg-cyan-500/30 text-white/50 cursor-not-allowed"
				}
				`}
			>
				配置待ちリストに追加
			</button>
			{!canAdd && (
				<p className="text-red-400 text-xs mt-1">入力内容に誤りがあります</p>
			)}
		</div>
	);
}
