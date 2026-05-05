import { useNavigate } from "react-router-dom";

export default function Page() {
	const navigate = useNavigate();

	return (
		<div style={{ width: "100vw", height: "100vh", position: "relative" }}>
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white">
				<h1
					className="
						text-7xl
						font-extrabold
						tracking-widest
						text-white
						mb-10
						animate-pulse
						drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]
						whitespace-nowrap
					"
				>
					ページが見つかりません
				</h1>
				<button
					type="button"
					onClick={() => navigate("/")}
					className="
						px-10 py-4
						text-xl font-semibold
						text-white
						bg-blue-500
						rounded-xl
						shadow-lg shadow-blue-500/40
						border border-blue-300
						transition
						hover:bg-blue-400
						hover:scale-105
						active:scale-95
					"
				>
					スタート画面に戻る
				</button>
			</div>
		</div>
	);
}
