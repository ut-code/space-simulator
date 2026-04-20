// BinaryStarContent.tsx
import { BlockMath } from "react-katex";

export default function BinaryStarContent() {
	return (
		<div className="space-y-8 text-gray-200 leading-relaxed">
			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					1. 連星（バイナリスター）とは？
				</h3>
				<p>
					夜空に輝く星の多くは、実は1つではなく、2つ以上の星がお互いの周りをぐるぐると回り合っています。
					このように、重力で結びついたペアの星を<strong>「連星」</strong>
					と呼びます。
					太陽のように1つポツンと存在している星よりも、宇宙では連星の方がメジャーな存在なのです。
				</p>
			</section>

			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					2. 「共通の重心」を中心に回る
				</h3>
				<p>
					連星は、一方がもう一方の周りを回っているように見えますが、正確には2つの星の
					<strong>「重心（重さのバランスが取れる点）」</strong>
					を中心に回っています。
				</p>
				<p className="mt-4">
					これは公園の<strong>シーソー</strong>と同じです。
					同じ体重の二人が乗れば真ん中が中心になりますが、一方が重い場合は、中心は重い人の方に寄ります。
				</p>
				<div className="bg-white/5 p-6 md:p-8 rounded-[2rem] my-6 border border-white/10 shadow-inner">
					<p className="text-sm text-blue-200/60 mb-4 text-center uppercase tracking-widest">
						重心のバランスの式
					</p>
					<p className="text-gray-300 mb-4">
						2つの星の重さと、<strong>重心からの距離</strong>
						には次の関係があります。
					</p>
					<div className="text-3xl text-blue-400 my-6 text-center">
						<BlockMath math={"M_1 r_1 = M_2 r_2"} />
					</div>
					<p className="text-sm text-gray-400 border-t border-white/10 pt-4">
						<strong>直感的な解釈：</strong>{" "}
						2つの星は同じ時間で1周する関係になっています。
						そのため、重心から遠い星ほど大きな円を回り、同じ時間でもより長い道のりを進みます。
					</p>
				</div>
			</section>

			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					3. 連星を維持するバランス
				</h3>
				<p className="mb-4">
					星が円を描いて回り続けるには、常に中心に向かって引っ張る力（向心力）が必要です。連星の場合、この役割をお互いに引き合う「万有引力」が果たしています。
				</p>
				<p className="text-sm text-gray-400 italic">
					※回転している星の上から見ると、外側に逃げようとする「遠心力」と「万有引力」が釣り合っているように見えます（遠心力は見かけの力です）。
				</p>
				<div className="bg-white/5 p-6 md:p-8 rounded-[2rem] my-6 border border-white/10 shadow-inner">
					<p className="text-sm text-orange-200/60 mb-4 text-center uppercase tracking-widest">
						力のつり合いの式（星1の場合）
					</p>
					<p className="text-gray-300 mb-4">
						星1にかかる「見かけの遠心力」と「相手から受ける万有引力」のバランスはこう書けます。
					</p>
					<div className="text-3xl text-orange-400 my-6 text-center">
						<BlockMath
							math={"M_1 \\frac{v_1^2}{r_1} = G \\frac{M_1 M_2}{(r_1 + r_2)^2}"}
						/>
					</div>
					<div className="text-sm text-gray-400 border-t border-white/10 pt-4 space-y-2">
						<p>
							<strong>直感的な解釈：</strong>
						</p>
						<ul className="list-disc list-inside ml-2">
							<li>
								2つの星は<strong>全く同じ時間（周期）</strong>
								をかけて1周します。
							</li>
							<li>
								重心から遠くを回る軽い星は、移動距離が長いため、重い星よりも移動スピードが速くなります。
							</li>
						</ul>
					</div>
				</div>
			</section>

			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					4. 理想的な軌道を作ってみよう
				</h3>
				<p>
					シミュレーションで綺麗な円軌道の連星を作るためのステップを紹介します。
				</p>
				<div className="bg-blue-900/30 p-6 rounded-2xl border border-blue-500/20 mt-6">
					<h4 className="text-xl font-bold text-blue-200 mb-3 flex items-center gap-2">
						<span>🎮</span> ミッション：連星を安定させよう
					</h4>
					<ul className="list-disc list-inside space-y-3 text-sm text-gray-300">
						<li>
							<strong>同じ重さで試す：</strong>
							まずは2つの星を同じ質量にして、中心から等距離に配置してみましょう。速度を全く逆向きに与えると、綺麗な円を描きます。
						</li>
						<li>
							<strong>重さを変えてみる：</strong>
							一方の星を2倍の重さにしてみましょう。重心は重い星に近くなります。重い星の初速度を小さく、軽い星の初速度を大きく設定するのがコツです。
						</li>
						<li>
							<strong>速度の向き：</strong>
							速度は、常に重心（2つの星を結ぶ線の中間点付近）に対して垂直な方向に与える必要があります。
						</li>
						<p>
							連星がうまくできたら、今度は星の大きさ（質量）をいろいろ変えてみましょう。
							重さの違いを大きくすると、2つの星の動き方や回る中心の位置（重心）がどう変わるか観察できます。
							「重い星と軽い星では、どちらがどんな動きをするのか？」
							実際に動かして確かめてみることが大切です。
						</p>
					</ul>
				</div>
				<div className="bg-white/5 p-6 rounded-2xl border border-white/10 mt-6">
					<p className="text-sm font-bold text-green-300 mb-2">💡 ヒント</p>
					<p className="text-sm text-gray-400">
						もし星が衝突してしまったら「初速度が足りない」サインです。逆に、お互い離れていってしまったら「速すぎる」ことになります。
						絶妙なバランスを見つけて、宇宙のダンスを完成させてください！
					</p>
				</div>
			</section>
		</div>
	);
}
