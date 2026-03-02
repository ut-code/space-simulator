import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
import PlanetsArrangement from "@/pages/PlanetsArrangement";
import Simulation from "@/pages/Simulation";

export const AppRouter = () => (
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/simulation" element={<Simulation />} />
			<Route path="/planets-arrangement" element={<PlanetsArrangement />} />
		</Routes>
	</BrowserRouter>
);
