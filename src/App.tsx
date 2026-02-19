import { Analytics } from "@vercel/analytics/react";

import "./App.css";

import { Routes, Route } from "react-router-dom";
import CoursePlannerPage from "./pages/CoursePlanner";
import GradeCalculatorPage from "./pages/GradeCalculator";
import NotFoundPage from "./pages/NotFound";
import Footer from "./components/Footer";
function App() {
  return (
    <>
      <Analytics />

      <Routes>
        <Route path="/" element={<CoursePlannerPage />} />
        {/* <Route path="/" element={<Navigate to="/courseplanner" replace />} /> */}
        <Route path="/courseplanner" element={<CoursePlannerPage />} />
        <Route path="/gradecalculator" element={<GradeCalculatorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
