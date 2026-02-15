import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Simulation from "@/pages/Simulation";

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/simulation" element={<Simulation />} />
    </Routes>
  </BrowserRouter>
);
