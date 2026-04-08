// CircularMotionContent.tsx
import { BlockMath, InlineMath } from "react-katex";

export default function CircularMotionContent() {
	return (
		<div className="space-y-8 text-gray-200 leading-relaxed">
			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					1. 万有引力とは？
				</h3>
				<p>
					宇宙にあるすべての物体は、お互いに引き合っています。これを「万有引力」と呼びます。
					相手の質量（重さ）が大きく、距離が近いほど、その力は強くなります。
				</p>
				<div className="bg-white/5 p-8 rounded-[2rem] my-6 text-center border border-white/10 shadow-inner">
					<p className="text-sm text-blue-200/60 mb-4 uppercase tracking-widest">
						万有引力の公式
					</p>
					<div className="text-4xl text-blue-400 my-4">
						<BlockMath math={"F = G \\frac{M m}{r^2}"} />
					</div>
					<p className="text-xs text-gray-500 mt-4">
						※ $F$:引力, $G$:定数, $M,m$:重さ, $r$:距離
					</p>
				</div>
			</section>

			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					2. なぜ惑星は太陽に落ちないの？
				</h3>
				<p>
					惑星が太陽に引き寄せられているのに落ちていかないのは、惑星が横方向にものすごいスピードで動いているからです。
					この「飛んでいこうとする勢い（遠心力）」と「引き合う力（万有引力）」がちょうど釣り合うと、惑星はきれいな円を描いて回り続けます。
				</p>
			</section>

			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					3. 等速円運動のしくみ
				</h3>
				<p>
					円運動を維持するためには、常に中心に向かう力（向心力）が必要です。惑星の場合、この向心力の役割を「万有引力」が果たしています。
				</p>
				<div className="bg-white/5 p-8 rounded-[2rem] my-6 text-center border border-white/10 shadow-inner">
					<p className="text-sm text-orange-200/60 mb-4 uppercase tracking-widest">
						円運動が成立する条件（バランスの式）
					</p>
					<div className="text-4xl text-orange-400 my-4">
						<BlockMath math={"m \\frac{v^2}{r} = G \\frac{M m}{r^2}"} />
					</div>
					<p className="text-xs text-gray-500 mt-4">
						（左辺：遠心力 ＝ 右辺：万有引力）
					</p>
				</div>
				<p className="mt-6">
					この式を解くと、ある距離 <InlineMath math={"r"} />{" "}
					において安定して回り続けるための速度 <InlineMath math={"v"} />{" "}
					が決まります。
					スピードが速すぎると外へ飛んでいき、遅すぎると太陽へ落ちてしまうのです。
				</p>
			</section>
		</div>
	);
}
