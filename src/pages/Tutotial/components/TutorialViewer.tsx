import { Stars } from "@react-three/drei";
import { useNavigate, useParams } from "react-router-dom";
import ThreeCanvas from "@/components/Canvas";
import HomeScene from "@/components/Scene";
// KaTeXのスタイルとコンポーネントをインポート
import "katex/dist/katex.min.css";
import { tutorialSections } from "@/pages/Tutotial/components/data";

export default function Page() {
	const navigate = useNavigate();
	const { id } = useParams();
	const tutorialId = id ?? tutorialSections[0].id;

	// 該当するコンテンツを取得（なければデフォルトを表示）
	//const detail = TUTORIAL_DETAILS[tutorialId] || TUTORIAL_DETAILS.gravity;
	const detail =
		tutorialSections.find((section) => section.id === tutorialId) ??
		tutorialSections[0];
	const title = detail.title;
	const Content = detail.Content;
	const simPath = detail.simPath;

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
					bg-black/60
					backdrop-blur-2xl
					rounded-[3rem]
					p-12 md:p-20
					max-w-6xl
					w-full
					h-fit
					my-auto
					border border-white/20
					shadow-[0_0_50px_rgba(0,0,0,0.5)]
					flex flex-col gap-12
				"
				>
					<div className="text-center space-y-4">
						<h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white italic uppercase">
							{title}
						</h1>
						<div className="h-1 w-24 bg-blue-500 mx-auto rounded-full" />
					</div>

					<div className="flex-1">
						<Content />
					</div>

					{tutorialSections.some((section) => section.id === id) && (
						<div className="flex flex-col items-center gap-6 pt-8 border-t border-white/10">
							{simPath && (
								<button
									type="button"
									onClick={() => navigate(simPath)}
									className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 cursor-pointer"
								>
									テンプレートから開始する
								</button>
							)}
							<button
								type="button"
								onClick={() => navigate(`/play`)}
								className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 cursor-pointer"
							>
								シミュレーションを開始する
							</button>
							<button
								type="button"
								onClick={() => navigate("/tutorial")}
								className="text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.4em] cursor-pointer"
							>
								← Back to List
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
