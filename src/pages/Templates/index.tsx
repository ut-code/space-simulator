import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { templates } from "@/data/templates";

const templateDescriptions: Record<string, string> = {
	default: "1つの地球から始める基本シミュレーション",
	solar: "太陽系の主要天体を配置したテンプレート",
	binary: "2つの恒星が互いを公転する連星系",
	"asteroid-belt": "小惑星帯を含むダイナミックな系",
};

function getTemplateTitle(id: string): string {
	if (id === "default") return "デフォルト";
	if (id === "solar") return "太陽系";
	if (id === "binary") return "連星系";
	if (id === "asteroid-belt") return "小惑星帯";
	return id;
}

export default function Page() {
	const navigate = useNavigate();
	const templateIds = useMemo(() => Array.from(templates.keys()), []);

	return (
		<div className="min-h-screen bg-slate-950 text-white px-6 py-12">
			<div className="mx-auto max-w-5xl">
				<h1 className="text-4xl font-bold tracking-wide mb-3">テンプレート</h1>
				<p className="text-slate-300 mb-8">
					開始したいテンプレートを選択してください。
				</p>

				<div className="grid gap-4 md:grid-cols-2">
					{templateIds.map((id) => (
						<div
							key={id}
							className="rounded-xl border border-slate-700 bg-slate-900/60 p-5"
						>
							<h2 className="text-2xl font-semibold mb-2">
								{getTemplateTitle(id) ?? "テンプレート"}
							</h2>
							<p className="text-slate-300 mb-5">
								{templateDescriptions[id] ?? "テンプレート"}
							</p>
							<button
								type="button"
								onClick={() => navigate(`/play?template=${id}`)}
								className="px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 transition"
							>
								このテンプレートで開始
							</button>
						</div>
					))}
				</div>

				<div className="mt-8">
					<button
						type="button"
						onClick={() => navigate("/")}
						className="px-5 py-2 rounded-lg border border-slate-500 hover:bg-slate-800 transition"
					>
						ホームに戻る
					</button>
				</div>
			</div>
		</div>
	);
}
