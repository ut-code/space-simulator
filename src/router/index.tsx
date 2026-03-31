import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Loading from "@/components/Loading";
import Home from "@/pages/Home";

const NotFound = lazy(() => import("@/pages/NotFound"));
const Simulation = lazy(() => import("@/pages/Simulation"));

export const AppRouter = () => (
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<Home />} />
			<Route
				path="/simulation"
				element={
					<Suspense fallback={<Loading />}>
						<Simulation />
					</Suspense>
				}
			/>
			<Route
				path="*"
				element={
					<Suspense fallback={<Loading />}>
						<NotFound />
					</Suspense>
				}
			/>
		</Routes>
	</BrowserRouter>
);
