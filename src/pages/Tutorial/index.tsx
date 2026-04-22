import { Stars } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import ThreeCanvas from "@/components/Canvas";
import HomeScene from "@/components/Scene";

const tutorialCards = [
	{
		title: "How to Play",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae posuere turpis, at mattis augue.",
		href: "/tutorial/how-to-play",
	},
	{
		title: "Physics Guide",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec sit amet metus in risus faucibus cursus.",
		href: "/tutorial/physics",
	},
];

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

			<div className="absolute inset-0 overflow-y-auto flex justify-center p-6 py-12 md:py-20">
				<div
					className="
					bg-black/40
					backdrop-blur-xl
					rounded-[2.5rem]
					p-10 md:p-16
					max-w-4xl
					w-full
					h-fit
					my-auto
					border border-white/10
					shadow-2xl
					flex flex-col gap-12
				"
				>
					<div className="text-center">
						<h1 className="text-5xl font-black tracking-tight text-white mb-4 italic uppercase">
							Tutorial
						</h1>
						<p className="text-blue-200 text-lg opacity-80">
							宇宙シミュレーションの基本を学ぶ
						</p>
					</div>

					<div className="flex flex-col gap-6">
						{tutorialCards.map((card) => (
							<button
								type="button"
								key={card.title}
								onClick={() => navigate(card.href)}
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
									{card.title}
								</h2>
								<p className="text-gray-400 leading-relaxed line-clamp-2">
									{card.description}
								</p>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
