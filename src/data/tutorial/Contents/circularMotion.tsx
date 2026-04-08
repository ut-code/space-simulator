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
						※ F:引力, G:定数, M,m:重さ, r:距離
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

			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					4. 理想的な速度を計算してみよう
				</h3>
				<p>
					バランスの式を整理して、速度 <InlineMath math={"v"} /> を半径{" "}
					<InlineMath math={"r"} /> の関数として表すと次のようになります。
				</p>
				<div className="bg-white/5 p-8 rounded-[2rem] my-6 text-center border border-white/10 shadow-inner">
					<p className="text-sm text-green-200/60 mb-4 uppercase tracking-widest">
						軌道速度の公式
					</p>
					<div className="text-4xl text-green-400 my-4">
						<BlockMath math={"v = \\sqrt{\\frac{GM}{r}}"} />
					</div>
					<p className="text-xs text-gray-500 mt-4">
						この式は、
						<strong>「中心から遠くなるほど、ゆっくり回れば安定する」</strong>
						ことを示しています。
					</p>
				</div>
				<div className="bg-blue-900/30 p-6 rounded-2xl border border-blue-500/20">
					<h4 className="text-xl font-bold text-blue-200 mb-3 flex items-center gap-2">
						<span>🎮</span> シミュレーションで「手探り」してみよう
					</h4>
					<p className="mb-4">
						理論がわかったら、次は実際にシミュレーションで体験してみる番です。
					</p>
					<ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
						<li>
							太陽からの距離（半径 <InlineMath math={"r"} />
							）をいろいろ変えて惑星を置いてみましょう。
						</li>
						<li>
							配置時の初速度を少しずつ変えて、きれいな円軌道を描く「マジックナンバー」を探してみてください。
						</li>
						<li>
							速度が足りないと太陽へ落下し、速すぎると宇宙の彼方へ逃げてしまいます。ちょうど良いバランスを見つけ出せるでしょうか？
						</li>
					</ul>
				</div>
			</section>
		</div>
	);
}
