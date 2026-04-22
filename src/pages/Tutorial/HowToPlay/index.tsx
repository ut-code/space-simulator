import { Stars } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import ThreeCanvas from "@/components/Canvas";
import HomeScene from "@/components/Scene";

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
				<div className="bg-black/60 backdrop-blur-2xl rounded-[3rem] p-12 md:p-20 max-w-6xl w-full h-fit my-auto border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col gap-12">
					<div className="text-center space-y-4">
						<h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white italic uppercase">
							How to Play
						</h1>
						<p className="text-blue-200 text-lg opacity-80">
							宇宙シミュレーションで遊ぶ方法を知る
						</p>
					</div>

					<div className="grid gap-6 md:grid-cols-3">
						{[
							"右側パネルで惑星タイプを選び、半径・質量・自転速度を調整します。",
							"位置と速度を設定し、必要なら 3D 面クリック配置を ON にして座標を決めます。設定できたら配置待ちリストに追加します。",
							"配置待ちリストを確認して一括配置するとシミュレーション空間へ反映されます。",
						].map((text, index) => (
							<div
								key={text}
								className="rounded-3xl border border-white/10 bg-white/10 p-8 text-gray-300 leading-relaxed"
							>
								<p className="text-sm uppercase tracking-[0.35em] text-blue-200/60 mb-4 font-bold">
									Step {index + 1}
								</p>
								<p>{text}</p>
							</div>
						))}
					</div>

					<div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-gray-300 leading-relaxed">
						<p className="text-xl font-semibold text-white mb-3">操作のコツ</p>
						<p>
							Helpers
							でグリッド・軸・プレビュー表示を切り替えると見やすくなります。
							カメラが迷ったらカメラリセット、軌道を観察したいときは追尾を使うと便利です。テンプレートから始めることもできます。
						</p>
					</div>

					<div className="flex flex-col items-center gap-6 pt-8 border-t border-white/10">
						<button
							type="button"
							onClick={() => navigate("/play")}
							className="w-64 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105 cursor-pointer"
						>
							シミュレーションを開始する{" "}
						</button>
						<button
							type="button"
							onClick={() => navigate("/tutorial")}
							className="text-gray-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.4em] cursor-pointer"
						>
							Back to Menu
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
