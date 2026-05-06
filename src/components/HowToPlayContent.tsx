export default function Content() {
	return (
		<>
			<div className="text-center space-y-4">
				<h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white italic uppercase">
					遊び方
				</h1>
				<p className="text-blue-200 text-lg opacity-80">
					宇宙シミュレーションで遊ぶ方法を知る
				</p>
			</div>

			<div className="flex justify-center">
				<div className="w-fit rounded-3xl border border-white/10 bg-white/10 p-8 text-gray-300 leading-relaxed">
					<p className="text-2xl text-center font-semibold text-white mb-3">
						基本操作
					</p>
					<div className="flex flex-col text-lg items-left gap-2 text-gray-300">
						<div className="flex items-center gap-2">
							<span>①　左クリック＋ドラッグで視点を回転</span>
						</div>

						<div className="flex items-center gap-2">
							<span>②　右クリック＋ドラッグで視点を移動</span>
						</div>

						<div className="flex items-center gap-2">
							<span>③　スクロールで拡大・縮小</span>
						</div>
					</div>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-3">
				{[
					"右側パネルで惑星タイプを選び、半径・質量・自転速度を調整します。",
					"位置と速度を設定し、必要なら 3D 面クリック配置を ON にして座標を決めます。設定できたら配置待ちリストに追加します。",
					"配置待ちリストを確認して一括配置するとシミュレーション空間へ反映されます。",
				].map((text, index) => (
					<div
						key={text}
						className="rounded-3xl border border-white/10 bg-white/10 p-8 text-gray-300 leading-relaxed"
					>
						<p className="text-center text-sm uppercase tracking-[0.35em] text-blue-200/60 mb-4 font-bold">
							Step {index + 1}
						</p>
						<p>{text}</p>
					</div>
				))}
			</div>

			<div className="rounded-3xl border border-white/10 bg-white/10 p-8 text-gray-300 leading-relaxed">
				<p className="text-center text-xl font-semibold text-white mb-3">
					操作のコツ
				</p>
				<p>
					ヘルパー
					でグリッド・軸・プレビュー表示を切り替えると見やすくなります。
					カメラが迷ったらカメラリセット、軌道を観察したいときは追尾を使うと便利です。テンプレートから始めることもできます。
				</p>
			</div>
		</>
	);
}
