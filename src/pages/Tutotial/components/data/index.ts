import type React from "react";
import BinaryStarContent from "./contents/BinaryStarContent";
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
		path: "/tutorial/fallBack",
		Content: fallBack,
	},
	{
		id: "circularMotion",
		title: "万有引力の法則と円運動",
		description:
			"万有引力の法則を使って、天体が互いに引き合いながら円運動する仕組みを学びます。",
		path: "/tutorial/circularMotion",
		Content: CircularMotionContent,
	},
	{
		id: "binaryStar",
		title: "連星系",
		description:
			"2つ以上の星が互いの重力で引き合いながら共通の重心のまわりを回るしくみを学びます。",
		path: "/tutorial/binaryStar",
		Content: BinaryStarContent,
	},
];
