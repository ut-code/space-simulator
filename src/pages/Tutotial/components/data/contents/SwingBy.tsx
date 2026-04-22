import { BlockMath } from "react-katex";

export default function SwingByContent() {
	return (
		<div className="space-y-8 text-gray-200 leading-relaxed">
			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					1. 宇宙の加速装置「スイングバイ」
				</h3>
				<p>
					宇宙探査機が、燃料をほとんど使わずにスピードをグンと上げる魔法のような技術、それが
					<strong>「スイングバイ」</strong>（重力アシスト）です。
					惑星の横をギリギリですれ違うことで、その惑星の重力を利用して自分を弾き飛ばしてもらう仕組みです。
				</p>
				<p className="mt-4 italic text-sm text-gray-400">
					※「はやぶさ」や「ボイジャー」などの探査機が遠い宇宙へ行くためによく使われます。
				</p>
			</section>

			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					2. 惑星の動きを「盗む」しくみ
				</h3>
				<p>
					なぜ、そばを通るだけで速くなるのでしょうか？ それは、通りすがる惑星が
					<strong>「動いているから」</strong>です。
				</p>
				<p className="mt-4">
					止まっている天体のそばを通っても、近づくときに加速した分、離れるときに同じだけ減速してしまいます。
					しかし、動いている惑星に向かっていくと、惑星の移動スピードの一部を「もらう」ことができるのです。
				</p>
				<div className="bg-white/5 p-8 rounded-[2rem] my-6 text-center border border-white/10 shadow-inner">
					<p className="text-sm text-blue-200/60 mb-4 uppercase tracking-widest">
						エネルギーのやり取り（イメージ）
					</p>
					<div className="text-3xl text-blue-400 my-4 font-bold">
						探査機の速度 += 惑星の速度の成分
					</div>
					<p className="text-xs text-gray-500 mt-4">
						相対速度が変化 → 観測すると加速したように見える
					</p>
					<p className="text-xs text-gray-500 mt-4">
						動いているトラックにロープを投げて、引っ張ってもらうようなイメージです！
					</p>
				</div>
			</section>

			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					3. 惑星同士でも起こる「巨大なキャッチボール」
				</h3>
				<p>
					スイングバイは人工衛星だけの技術ではありません。
					このシミュレーターのように
					<strong>惑星同士、天体同士でも全く同じこと</strong>が起こります。
				</p>
				<p className="mt-4">
					物理学では、これを<strong>「運動量保存の法則」</strong>で説明します。
				</p>
				<div className="bg-white/5 p-8 rounded-[2rem] my-6 text-center border border-white/10 shadow-inner">
					<p className="text-sm text-orange-200/60 mb-4 uppercase tracking-widest">
						運動量保存の法則
					</p>
					<div className="text-4xl text-orange-400 my-4">
						<BlockMath math={"m_1 v_1 + m_2 v_2 = \\text{一定}"} />
					</div>
					<p className="text-xs text-gray-500 mt-4">
						m: 重さ, v: 速度（1番が飛んできた天体、2番が待ち構える惑星）
					</p>
				</div>
				<p className="mt-4">
					軽い天体が重い惑星に近づくと、軽い方は猛烈に加速し、重い惑星はほんの、ほんの少しだけ減速します（質量が大きすぎるため、ほとんど変化は観測できません）。
					宇宙ではこのように、天体同士が重力でエネルギーをやり取りしながら、お互いの軌道を変え合っているのです（これを「重力散乱」と呼びます）。
				</p>
			</section>

			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					4. 最強のスイングバイに挑戦！
				</h3>
				<p>
					このシミュレーターを使えば、あなたも宇宙ナビゲーターです。
					惑星を配置して、別の天体をその「後ろ側」から追い越すように投げてみましょう。
				</p>
				<div className="bg-blue-900/30 p-6 rounded-2xl border border-blue-500/20 mt-6">
					<h4 className="text-xl font-bold text-blue-200 mb-3 flex items-center gap-2">
						<span>🎮</span> スイングバイ・ミッション
					</h4>
					<ul className="list-disc list-inside space-y-3 text-sm text-gray-300">
						<li>
							<strong>加速スイングバイ：</strong>
							惑星の進行方向の「後ろ」をかすめるように通してみましょう。天体が加速して遠くへ飛んでいけば成功です！
						</li>
						<li>
							<strong>減速スイングバイ：</strong>
							逆に、惑星の「前」を横切るとどうなるでしょうか？
							スピードが落ちて内側の軌道へ吸い込まれる様子を観察しましょう。
						</li>
						<li>
							<strong>惑星散乱：</strong>
							木星のような巨大な惑星の近くに、小さな惑星をたくさん置いてみてください。バラバラに弾き飛ばされる「重力のダンス」が見られるはずです。
						</li>
					</ul>
				</div>
				<div className="bg-white/5 p-6 rounded-2xl border border-white/10 mt-6">
					<p className="text-sm font-bold text-green-300 mb-2">💡 ヒント</p>
					<p className="text-sm text-gray-400">
						天体が描く「軌道の曲がり角」が急であればあるほど、大きなエネルギーがやり取りされています。
						太陽系を旅する探査機になったつもりで、自分だけの「最強ルート」をシミュレーションで見つけ出しましょう！
					</p>
				</div>
			</section>
		</div>
	);
}
