import { Stars } from "@react-three/drei";
import ThreeCanvas from "@/components/Canvas";
import HomeScene from "@/components/Scene";

export default function Page() {
	return (
		<div style={{ width: "100vw", height: "100vh", position: "relative" }}>
			<ThreeCanvas>
				<Stars
					radius={100} // 星が広がる球の半径
					depth={50} // 奥行き
					count={5000} // 星の数
					factor={4} // 星のサイズ
					saturation={0} // 色の鮮やかさ
					fade // 遠くの星をフェード
					speed={1} // 動き速度
				/>
				<HomeScene />
			</ThreeCanvas>

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
