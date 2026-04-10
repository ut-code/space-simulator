// NotFoundContent.tsx

export default function fallBack() {
	return (
		<div className="space-y-8 text-gray-200 leading-relaxed">
			<section>
				<h3 className="text-3xl font-bold text-red-400 mb-4 border-l-4 border-red-500 pl-4">
					ページが見つかりません
				</h3>
				<p>
					指定されたチュートリアルは存在しないか、URLが間違っています。
					下のボタンからチュートリアル一覧に戻ることができます。
				</p>
				<div className="bg-white/5 p-8 rounded-[2rem] my-6 text-center border border-white/10 shadow-inner">
					<p className="text-sm text-red-200/60 mb-4 uppercase tracking-widest">
						お知らせ
					</p>
					<p className="text-base text-gray-300 mt-4">
						このページは現在表示できません。
					</p>
				</div>
			</section>

			<section className="text-center">
				<a
					href="/tutorial"
					className="inline-block mt-4 px-10 py-4 bg-red-600 hover:bg-red-500 text-white rounded-full font-bold text-lg transition-all transform hover:scale-105"
				>
					チュートリアル一覧に戻る
				</a>
			</section>
		</div>
	);
}
