import type React from "react";
import BinaryStarContent from "./contents/BinaryStarContent";
import CircularMotionContent from "./contents/CircularMotion";
import Eccentricity from "./contents/Eccentricity";
import SolarSystemContent from "./contents/SolarSystem";
import SwingBy from "./contents/SwingBy";

type Tutorial = {
	id: string;
	title: string;
	description: string;
	path: string;
	simPath: null | string;
	Content: React.FC;
};

export const tutorialSections: Tutorial[] = [
	{
		id: "circular-motion",
		title: "万有引力の法則と円運動",
		description:
			"万有引力の法則を使って、天体が互いに引き合いながら円運動する仕組みを学びます。",
		path: "/tutorial/circularMotion",
		simPath: null,
		Content: CircularMotionContent,
	},
	{
		id: "solar-system",
		title: "太陽系",
		description:
			"太陽を中心に、惑星や天体がどのように運動しているかを学び、太陽系の構造を理解します。",
		path: "/tutorial/solarSystem",
		simPath: "/play?template=solar",
		Content: SolarSystemContent,
	},
	{
		id: "binary-star",
		title: "連星系",
		description:
			"2つ以上の星が互いの重力で引き合いながら共通の重心のまわりを回るしくみを学びます。",
		path: "/tutorial/binaryStar",
		simPath: "/play?template=binary",
		Content: BinaryStarContent,
	},
	{
		id: "eccentricity",
		title: "軌道離心率",
		description:
			"天体が描く楕円軌道の形のゆがみを表す量で、円軌道からどれだけ外れているかを示します。",
		path: "/tutorial/eccentricity",
		simPath: null,
		Content: Eccentricity,
	},
	{
		id: "swing-by",
		title: "スイングバイ",
		description:
			"天体の重力を利用して宇宙機の速度や進行方向を変える航法技術で、燃料をほとんど使わずに加速や軌道変更ができます。",
		path: "/tutorial/swingBy",
		simPath: null,
		Content: SwingBy,
	},
];
