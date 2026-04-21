// SolarSystemContent.tsx
import { BlockMath } from "react-katex";

export default function SolarSystemContent() {
	return (
		<div className="space-y-8 text-gray-200 leading-relaxed">
			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					1. 太陽系：太陽を中心とした巨大な家族
				</h3>
				<p>
					太陽系は、中心にある巨大な星<strong>「太陽」</strong>
					と、その周りを回る惑星や彗星たちの集まりです。
					太陽系全体の重さ（質量）のうち、なんと <strong>99.8%</strong>{" "}
					を太陽が占めています。
					この圧倒的な重力によって、遠くの惑星たちも逃げ出さずに太陽の周りを回り続けているのです。
				</p>
				<div className="bg-white/5 p-8 rounded-[2rem] my-6 text-center border border-white/10 shadow-inner">
					<p className="text-blue-200 font-bold mb-2">
						太陽に近い順に並べてみよう
					</p>
					<p className="text-xl tracking-[0.2em] text-blue-400">
						水星 → 金星 → 地球 → 火星 → 木星 → 土星 → 天王星 → 海王星
					</p>
					<p className="text-xs text-gray-500 mt-4 italic">
						「すい・きん・ち・か・もく・ど・てん・かい」で覚えよう！
					</p>
				</div>
			</section>

			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					2. 惑星には「2つのタイプ」がある
				</h3>
				<p>
					太陽系の8つの惑星は、その特徴から大きく2つのグループに分けられます。
				</p>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
					<div className="bg-white/5 p-6 rounded-2xl border border-white/10">
						<p className="text-orange-300 font-bold mb-2">地球型惑星</p>
						<p className="text-xs text-gray-400 mb-2">
							（水星・金星・地球・火星）
						</p>
						<p className="text-sm">
							岩石でできていて、地面がある惑星。サイズは小さめだけど、密度がぎゅっと詰まっています。
						</p>
					</div>
					<div className="bg-white/5 p-6 rounded-2xl border border-white/10">
						<p className="text-blue-300 font-bold mb-2">木星型・天王星型惑星</p>
						<p className="text-xs text-gray-400 mb-2">
							（木星・土星・天王星・海王星）
						</p>
						<p className="text-sm">
							ガスや氷でできていて、巨大な惑星。地球のような固い地面はなく、雲が渦巻いています。
						</p>
					</div>
				</div>
			</section>

			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					3. 遠いほど「ゆっくり」長く回る
				</h3>
				<p>
					太陽から遠い惑星ほど、1周（公転）するのにかかる時間が長くなります。
					これを発見したのはケプラーという科学者で、
					<strong>「ケプラーの第3法則」</strong>と呼ばれます。
				</p>
				<div className="bg-white/5 p-8 rounded-[2rem] my-6 text-center border border-white/10 shadow-inner">
					<p className="text-sm text-green-200/60 mb-4 uppercase tracking-widest">
						ケプラーの第3法則（イメージ）
					</p>
					<div className="text-4xl text-green-400 my-4">
						<BlockMath math={"T^2 \\propto a^3"} />
					</div>
					<p className="text-xs text-gray-500 mt-4 italic">
						T: 1周する時間, a: 太陽からの距離
					</p>
				</div>
				<p className="mt-6 text-sm">
					例えば、地球は1年で太陽を1周しますが、一番外側の海王星は{" "}
					<strong>約165年</strong> もかけてゆっくりと1周します。
					太陽から遠い惑星ほど軌道が大きくなるため、1周するのに長い時間がかかります。
				</p>
			</section>

			<section>
				<h3 className="text-3xl font-bold text-blue-300 mb-4 border-l-4 border-blue-500 pl-4">
					4. 自分だけの太陽系を作ってみよう
				</h3>
				<p>シミュレーションを使って、太陽系の惑星たちを配置してみましょう。</p>
				<div className="bg-blue-900/30 p-6 rounded-2xl border border-blue-500/20 mt-6">
					<h4 className="text-xl font-bold text-blue-200 mb-3 flex items-center gap-2">
						<span>🎮</span> 太陽系シミュレーション・ガイド
					</h4>
					<ul className="list-disc list-inside space-y-3 text-sm text-gray-300">
						<li>
							<strong>内側の惑星：</strong>
							太陽の近くに惑星を置いて、速い初速度を与えてみましょう。水星のようにビュンビュン回る様子が見られます。
						</li>
						<li>
							<strong>外側の巨大惑星：</strong>
							太陽からずっと遠くに、重い惑星を置いてみましょう。速度をゆっくりに設定して、雄大な軌道を描けるか挑戦です。
						</li>
						<li>
							<strong>小惑星帯（アステロイドベルト）：</strong>
							火星と木星の間に、小さな天体をたくさん散りばめてみると、より本物の太陽系らしくなります。
						</li>
					</ul>
				</div>
				<div className="bg-white/5 p-8 rounded-[2rem] my-6 text-center border border-white/10 shadow-inner">
					<p className="text-sm text-gray-400">
						ヒント：太陽系は「平らな円盤」のような形をしています。真横から見たときに惑星が一直線に並ぶように配置すると、きれいな太陽系が作れますよ！
					</p>
				</div>
			</section>
		</div>
	);
}
