import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import Simulation from "@/pages/Simulation";

export const AppRouter = () => (
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/simulation" element={<Simulation />} />
			<Route path="*" element={<NotFound />} />
		</Routes>
	</BrowserRouter>
);
