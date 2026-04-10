import type React from "react";
import CircularMotionContent from "./contents/circularMotion";
import fallBack from "./contents/fallBack";

type Tutorial = {
	id: string;
	title: string;
	description: string;
	path: string;
	Content: React.FC;
};

export const tutorialSections: Tutorial[] = [
	{
		id: "fallBack",
		title: "ページが見つかりません",
		description: "ページが見つかりません",
		path: "/tutorial/page?tutorialId=fallBack",
		Content: fallBack,
	},
	{
		id: "circularMotion",
		title: "万有引力の法則と円運動",
		description:
			"ニュートンの法則に基づき、2つの天体が互いに引き合う力の仕組みを学びます。",
		path: "/tutorial/page?tutorialId=circularMotion",
		Content: CircularMotionContent,
	},
];
