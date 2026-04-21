import type React from "react";
import BinaryStarContent from "./contents/BinaryStarContent";
import CircularMotionContent from "./contents/circularMotion";
import Eccentricity from "./contents/Eccentricity";
import fallBack from "./contents/fallBack";
import SwingBy from "./contents/SwingBy";
import SolarSystemContent from "./contents/solarSystem";

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
		id: "solarSystem",
		title: "太陽系",
		description:
			"太陽を中心に、惑星や天体がどのように運動しているかを学び、太陽系の構造を理解します。",
		path: "/tutorial/solarSystem",
		Content: SolarSystemContent,
	},
	{
		id: "binaryStar",
		title: "連星系",
		description:
			"2つ以上の星が互いの重力で引き合いながら共通の重心のまわりを回るしくみを学びます。",
		path: "/tutorial/binaryStar",
		Content: BinaryStarContent,
	},
	{
		id: "eccentricity",
		title: "軌道離心率",
		description:
			"天体が描く楕円軌道の形のゆがみを表す量で、円軌道からどれだけ外れているかを示します。",
		path: "/tutorial/eccentricity",
		Content: Eccentricity,
	},
	{
		id: "swingBy",
		title: "スイングバイ",
		description:
			"天体の重力を利用して宇宙機の速度や進行方向を変える航法技術で、燃料をほとんど使わずに加速や軌道変更ができます。",
		path: "/tutorial/swingBy",
		Content: SwingBy,
	},
];
