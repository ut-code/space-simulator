import { Stars } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import ThreeCanvas from "@/components/Canvas";
import HomeScene from "@/components/Scene";
import { tutorialSections } from "@/pages/Tutotial/components/data";

export default function Page() {
	const navigate = useNavigate();

	return (
		<div style={{ width: "100vw", height: "100vh", position: "relative" }}>
			<ThreeCanvas>
				<Stars
					radius={100}
					depth={50}
					count={5000}
					factor={4}
					saturation={0}
					fade
					speed={1}
				/>
				<HomeScene />
			</ThreeCanvas>

			<div className="absolute inset-0 flex items-center justify-center p-6">
				{/* 半透明の大きなモーダルボックス */}
				<div
					className="
					bg-black/40
					backdrop-blur-xl
					rounded-[2.5rem]
					p-10 md:p-16
					max-w-4xl
					w-full
					max-h-[85vh]
					overflow-y-auto
					border border-white/10
					shadow-2xl
					flex flex-col gap-12
				"
				>
					<div className="text-center">
						<h1 className="text-5xl font-black tracking-tight text-white mb-4 italic uppercase">
							Physics Guide
						</h1>
						<p className="text-blue-200 text-lg opacity-80">
							天体の物理の基本を学ぶ
						</p>
					</div>

					{/* 各解説カードのリスト */}
					<div className="flex flex-col gap-6">
						{tutorialSections.map(
							(section) =>
								section.id !== tutorialSections[0].id && (
									<button
										type="button"
										key={section.title}
										onClick={() => navigate(section.path)}
										className="
									bg-white/10 hover:bg-white/20
									border border-white/10 hover:border-blue-500/50
									rounded-3xl p-8
									transition-all duration-300
									cursor-pointer
									group
								"
									>
										<h2 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors">
											{section.title}
										</h2>
										<p className="text-gray-400 leading-relaxed line-clamp-2">
											{section.description}
										</p>
									</button>
								),
						)}
					</div>

					<div className="flex justify-center">
						<button
							type="button"
							onClick={() => navigate("/")}
							className="text-gray-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.4em] cursor-pointer"
						>
							Back to Menu
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
