import { Leva, useControls } from "leva";
import ThreeCanvas from "@/pages/Home/Canvas";
import Scene from "@/pages/Home/Scene";

export default function Page() {
	const { color } = useControls({
		color: { value: "orange" }, // 初期値
	});

	return (
		<>
			<Leva />
			<ThreeCanvas>
				<Scene color={color} />
			</ThreeCanvas>
		</>
	);
}
