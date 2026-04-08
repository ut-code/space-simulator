import type React from "react";
import CircularMotionContent from "./Contents/circularMotion";

type Tutorial = {
	id: string;
	title: string;
	description: string;
	path: string;
	Content: React.FC;
};

export const tutorialSections: Tutorial[] = [
	{
		id: "circularMotion",
		title: "万有引力の法則と円運動",
		description:
			"ニュートンの法則に基づき、2つの天体が互いに引き合う力の仕組みを学びます。",
		path: "/tutorial/page?tutorialId=circularMotion",
		Content: CircularMotionContent,
	},
];

const _tutorialCopy = [
	{
		title: "万有引力の法則",
		description:
			"ニュートンの法則に基づき、2つの天体が互いに引き合う力の仕組みを学びます。",
		path: "/tutorial/page",
	},
	{
		title: "ケプラーの法則",
		description:
			"惑星が太陽の周りを回る軌道運動の3つの法則をシミュレーションで体験します。",
		path: "/play?tutorial=kepler",
	},
	{
		title: "多体系のダイナミクス",
		description:
			"3つ以上の天体が複雑に影響し合う系の混沌とした挙動を観察しましょう。",
		path: "/play?tutorial=n-body",
	},
];
