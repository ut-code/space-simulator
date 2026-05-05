import { useNavigate } from "react-router-dom";
import Content from "@/components/HowToPlayContent";

export default function Page() {
	const navigate = useNavigate();

	return (
		<div style={{ width: "100vw", height: "100vh", position: "relative" }}>
			<div className="absolute inset-0 overflow-y-auto flex justify-center p-6 py-12 md:py-20">
				<div className="bg-black/60 backdrop-blur-2xl rounded-[3rem] p-12 md:p-20 max-w-6xl w-full h-fit my-auto border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col gap-12">
					<Content />

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
							className="text-gray-400 hover:text-white transition-colors text-lg font-bold uppercase tracking-[0.4em] cursor-pointer"
						>
							メニューへ戻る
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
