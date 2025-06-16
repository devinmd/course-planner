import { Analytics } from "@vercel/analytics/react";

import { useState, useEffect } from "react";
import "./App.css";

import { Routes, Route } from "react-router-dom";
import CoursePlannerPage from "./pages/CoursePlanner";
import GradeCalculatorPage from "./pages/GradeCalculator";
import NotFoundPage from "./pages/NotFound";

function Footer() {
  const [showTos, setShowTos] = useState(false);
  const version = "1.2.0";
  const d = new Date();
  const copyrightYear = d.getFullYear();
  const url = new URL(window.location.href).hostname + new URL(window.location.href).pathname.replace(/\/$/, "");
  const contactLink = "https://forms.gle/qb8T4QdjP1F4EPVW6";
  const sourceCodeLink = "https://github.com/devinmd/course-planner";

  useEffect(() => {
    if (showTos) {
      // Wait for DOM to update before scrolling
      setTimeout(() => {
        document.querySelector(".tos")?.scrollIntoView({ behavior: "auto" });
      }, 100);
    }
  }, [showTos]);

  return (
    <>
      <footer className="normal-footer">
        <div className="copyright">
          <div>© {copyrightYear} Course Planner</div>
        </div>

        <div className="spacer" style={{ marginLeft: "auto" }}></div>
        <a href={contactLink} target="_blank">
          Suggestions, feedback, or questions? Contact here.
        </a>
        <div onClick={() => setShowTos(!showTos)} className="tos-button">
          {showTos ? "Hide Terms of Service ↓" : "Terms of Service"}
        </div>
        <a href={sourceCodeLink} target="_blank">
          Source Code
        </a>
        <div>{version}</div>
      </footer>

      <footer className="print-footer">
        <div className="copyright">
          <div>© {copyrightYear} Course Planner</div>
        </div>
        <div style={{ marginLeft: "auto" }}></div>
        <div>{url}</div>
        <div>{version}</div>
      </footer>

      {showTos && (
        <div className="tos">
          <p>
            The Course Planner app is a reference tool for planning your class schedule. It does not guarantee that your
            schedule is free from conflicts and/or meets all prerequisites and graduation requirements. Always consult
            with your counselor and refer to Veracross, Edsby, and the official Framework for final course selection.
          </p>
          <p>
            The Grade and GPA calculator is an unofficial tool designed to help estimate grades and GPA. It is not
            offical nor affiliated with any official system. The information should not be considered final, guaranteed,
            or fully accurate. Grade and GPA calculations may vary depending on many factors such as class and teacher.
            The outputs of this app are subject to change, may be inaccurate, and should not be fully relied on.
          </p>
          <p>GPA calculator rounds to the nearest hundredth</p>
          <p>
            Course planner last updated June 2025.
            <br />
            Grade and GPA calculator last updated June 2025.
          </p>
        </div>
      )}
    </>
  );
}
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
