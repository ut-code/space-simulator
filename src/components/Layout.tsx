import { Stars } from "@react-three/drei";
import { Outlet } from "react-router-dom";
import ThreeCanvas from "./Canvas";
import HomeScene from "./Scene";

export default function Layout() {
	return (
		<div className="w-screen h-screen relative">
			<ThreeCanvas>
				<Stars
					radius={100}
					depth={50}
					count={1000}
					factor={4}
					saturation={0}
					fade
					speed={1}
				/>
				<HomeScene />
			</ThreeCanvas>

			{/*ページUI（切り替わる） */}
			<div className="absolute inset-0">
				<Outlet />
			</div>
		</div>
	);
}
