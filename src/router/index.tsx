import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";

const Simulation = lazy(() => import("@/pages/Simulation"));

export const AppRouter = () => (
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/simulation" element={<Simulation />} />
			<Route path="*" element={<NotFound />} />
		</Routes>
	</BrowserRouter>
);
