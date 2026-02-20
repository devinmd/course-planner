import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "../hooks/useIsMobile";
import "./TopNav.css";

interface TopNavProps {
  onCheck?: (value: boolean) => void;
  onResetClasses?: () => void;
  copyURL?: () => void;
  useAbbreviations?: boolean;
}

export default function TopNav({
  onCheck,
  onResetClasses,
  copyURL,
  useAbbreviations,
}: TopNavProps) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [showMobileSettings, setShowMobileSettings] = useState<boolean>(false);

  const isCoursePlanner = location.pathname === "/" || location.pathname === "/courseplanner";
  const isGradeCalculator = location.pathname === "/gradecalculator";

  return (
    <>
      <div className="topnav">
        {/* logos */}
        <div className="logo-container">
          <Link to="/courseplanner" className={isCoursePlanner ? "" : "inactive"} style={{ borderBottom: isCoursePlanner ? "4px solid #2463EB" : "4px solid transparent", height: "calc(4rem - 4px)", padding: "0 1rem" }}>
            <img className="logo" src="/logo.svg" />
          </Link>
          <Link to="/gradecalculator" className={isGradeCalculator ? "" : "inactive"} style={{ borderBottom: isGradeCalculator ? "4px solid #16C216" : "4px solid transparent", height: "calc(4rem - 4px)", padding: "0 1rem" }}>
            <img className="logo" src="/logo2.svg" />
          </Link>
        </div>

        {isMobile && (
          <>
            <button
              onClick={() => setShowMobileSettings(!showMobileSettings)}
              className="mobile-options-button"
            ></button>
          </>
        )}

        {/* mobile settings modal */}
        {showMobileSettings && onCheck && onResetClasses && copyURL && (
          <div className="mobile-settings-wrapper" onClick={() => setShowMobileSettings(false)}>
            <div
              className="card mobile-settings
          "
              onClick={(event) => event.stopPropagation()}
            >
              <h3>Options</h3>
              <button
                className="white"
                onClick={() => {
                  setShowMobileSettings(false);
                }}
              >
                Close
              </button>
              <button
                className="white"
                onClick={() => {
                  onCheck(true);
                  setShowMobileSettings(false);
                }}
              >
                {useAbbreviations ? "Show Full Course Names" : "Abbreviate Course Names"}
              </button>

              <button
                className="red"
                onClick={() => {
                  onResetClasses();
                  setShowMobileSettings(false);
                }}
              >
                Reset
              </button>
              <button
                className="blue"
                onClick={() => {
                  copyURL();
                  setShowMobileSettings(false);
                }}
              >
                Copy URL for Your Plan
              </button>
              <button className="blue" onClick={() => window.print()}>
                Print
              </button>
            </div>
          </div>
        )}
        {/* desktop buttons */}
        {!isMobile && onCheck && onResetClasses && copyURL && (
          <>
            <div style={{ marginLeft: "auto" }}></div>
            <div className="topnav-buttons">
              <button className="white abbreviations" onClick={() => onCheck(true)}>
                {useAbbreviations ? "Show Full Course Names" : "Abbreviate Course Names"}
              </button>

              <button className="red reset" onClick={() => onResetClasses()}>
                Reset
              </button>
              <button className="blue copyurl" onClick={() => copyURL()}>
                Copy URL for Your Plan
              </button>
              <button className="blue print" onClick={() => window.print()}>
                Print
              </button>
            </div>
            <div className="print-header">
              Printed Plan
              {/* {new URL(window.location.href).hostname + new URL(window.location.href).pathname.replace(/\/$/, "")} */}
            </div>
          </>
        )}
      </div>
    </>
  );
}
