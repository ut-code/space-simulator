import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Simulation from "@/pages/Simulation";
import PlanetsArrangement from "@/pages/PlanetsArrangement";

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/simulation" element={<Simulation />} />
      <Route path="/planets-arrangement" element={<PlanetsArrangement />} />
    </Routes>
  </BrowserRouter>
);
