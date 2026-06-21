import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import RouteDetail from "@/pages/RouteDetail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/route/:id" element={<RouteDetail />} />
      </Routes>
    </Router>
  );
}
