export default function Page() {
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
					"
				>
					ロード中...
				</h1>
			</div>
		</div>
	);
}
