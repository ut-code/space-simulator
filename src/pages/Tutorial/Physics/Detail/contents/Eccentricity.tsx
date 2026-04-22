// EccentricityContent.tsx
import { BlockMath, InlineMath } from "react-katex";

export default function EccentricityContent() {
	return (
		<div className="space-y-8 text-gray-200 leading-relaxed">
			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					1. 宇宙の軌道は「きれいな円」じゃない？
				</h3>
				<p>
					多くの人は、惑星は太陽の周りを「きれいな円」で回っていると思っているかもしれません。
					でも実は、ほとんどの天体は少しつぶれた円、つまり
					<strong>「楕円（だえん）」</strong>の形で動いています。
					この「どれくらい円からつぶれているか」を表す数字を
					<strong>「軌道離心率（きどうりしんりつ）」</strong>と呼びます。
				</p>
			</section>

			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					2. 離心率（e）の数字を見てみよう
				</h3>
				<p>
					離心率はアルファベットの <InlineMath math={"e"} />{" "}
					で表されます。この数字によって、軌道の形が決まります。
				</p>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
					<div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
						<p className="text-orange-400 font-bold mb-2">e = 0</p>
						<p className="text-sm">真ん丸な円</p>
					</div>
					<div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
						<p className="text-green-400 font-bold mb-2">0 &lt; e &lt; 1</p>
						<p className="text-sm">楕円（つぶれた円）</p>
					</div>
					<div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-center">
						<p className="text-red-400 font-bold mb-2">e ≧ 1</p>
						<p className="text-sm">
							重力に引かれても戻ってこない軌道（放物線・双曲線）
						</p>
					</div>
				</div>
				<p className="text-sm text-gray-400">
					地球の離心率は約 <strong>0.017</strong> なので、かなり円に近いです。
					一方で、遠くからやってくる彗星（すいせい）などは <strong>0.9</strong>{" "}
					を超えるような、ものすごく細長い楕円を描くことがあります。
				</p>
			</section>

			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					3. スピードと形の関係
				</h3>
				<p>
					なぜ軌道が楕円になるのでしょうか？ それは、天体の
					<strong>「速さ」</strong>が関係しています。
				</p>
				<div className="bg-white/5 p-8 rounded-[2rem] my-6 text-center border border-white/10 shadow-inner">
					<p className="text-sm text-blue-200/60 mb-4 uppercase tracking-widest">
						円軌道になるための速度
					</p>
					<div className="text-4xl text-blue-400 my-4">
						<BlockMath math={"v_{circle} = \\sqrt{\\frac{GM}{r}}"} />
					</div>
					<p className="text-xs text-gray-500 mt-4">
						この速度ぴったりだと <InlineMath math={"e = 0"} />
						（円）になります。
					</p>
				</div>
				<ul className="space-y-4">
					<li className="flex gap-4">
						<span className="text-blue-400 font-bold">●</span>
						<p>
							速度が <InlineMath math={"v_{circle}"} /> より
							<strong>少し速い、または遅い</strong>と、軌道は楕円になります。
						</p>
					</li>
					<li className="flex gap-4">
						<span className="text-blue-400 font-bold">●</span>
						<p>
							楕円軌道では、天体は<strong>「速くなったり遅くなったり」</strong>
							しながら回ります。太陽に近いときは速く、遠いときはゆっくり動くのが特徴です。
						</p>
					</li>
				</ul>
			</section>

			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					4. いろんな離心率を作ってみよう
				</h3>
				<p>
					シミュレーションを使って、軌道のカタチをコントロールしてみましょう。
				</p>
				<div className="bg-blue-900/30 p-6 rounded-2xl border border-blue-500/20 mt-6">
					<h4 className="text-xl font-bold text-blue-200 mb-3 flex items-center gap-2">
						<span>🎮</span> 軌道デザイン・ミッション
					</h4>
					<ul className="list-disc list-inside space-y-3 text-sm text-gray-300">
						<li>
							<strong>完璧な円を狙う：</strong>
							前のページで学んだ「マジックナンバー（円軌道速度）」をピタッと同じに設定して、離心率
							0 を目指しましょう。
						</li>
						<li>
							<strong>細長い楕円を作る：</strong>
							円軌道の速度から、あえて少しだけ速度を落としてみてください。太陽をかすめるような、美しい楕円軌道が描けるはずです。
						</li>
						<li>
							<strong>脱出速度に挑戦：</strong>
							速度をどんどん上げていくと、あるところで軌道が閉じなくなり、天体がどこかへ飛んでいってしまいます。これが離心率が
							1 を超えた瞬間です！
						</li>
					</ul>
				</div>
				<div className="bg-white/5 p-6 rounded-2xl border border-white/10 mt-6">
					<p className="text-sm font-bold text-green-300 mb-2">💡 ヒント</p>
					<p className="text-sm text-gray-400">
						天体が太陽に一番近づく点を「近日点（きんじつてん）」、一番遠ざかる点を「遠日点（えんにちてん）」と言います。
						離心率が大きければ大きいほど、この2つの地点でのスピードの差が激しくなるのを観察してみてください。
					</p>
				</div>
			</section>
		</div>
	);
}
