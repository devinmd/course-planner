import { Analytics } from "@vercel/analytics/react";

import "./App.css";


import { Routes, Route, Navigate } from "react-router-dom";
import CoursePlannerPage from "./pages/CoursePlanner";
import GradeCalculatorPage from "./pages/GradeCalculator";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Analytics />
      <Routes>
        <Route path="/" element={<CoursePlannerPage />} />
        <Route path="/gradecalculator" element={<GradeCalculatorPage />} />
        <Route path="/courseplanner" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
