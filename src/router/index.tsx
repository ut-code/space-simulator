import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Loading from "@/components/Loading";
import Home from "@/pages/Home";

const NotFound = lazy(() => import("@/pages/NotFound"));
const Simulation = lazy(() => import("@/pages/Play"));
const Templates = lazy(() => import("@/pages/Templates"));
const Tutorial = lazy(() => import("@/pages/Tutotial"));
const TutorialPage = lazy(
	() => import("@/pages/Tutotial/components/TutorialViewer"),
);

export const AppRouter = () => (
	<BrowserRouter>
		<Routes>
			<Route path="/" element={<Home />} />
			<Route
				path="/play"
				element={
					<Suspense fallback={<Loading />}>
						<Simulation />
					</Suspense>
				}
			/>
			<Route
				path="/templates"
				element={
					<Suspense fallback={<Loading />}>
						<Templates />
					</Suspense>
				}
			/>
			<Route
				path="/tutorial"
				element={
					<Suspense fallback={<Loading />}>
						<Tutorial />
					</Suspense>
				}
			/>
			<Route
				path="/tutorial/:id"
				element={
					<Suspense fallback={<Loading />}>
						<TutorialPage />
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
