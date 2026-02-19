import { useState } from "react";
import { Link } from "react-router-dom";
import { useIsMobile } from "../hooks/useIsMobile";
import "./TopNav.css";

interface TopNavProps {
  onCheck: (value: boolean) => void;
  onResetClasses: () => void;
  copyURL: () => void;
  useAbbreviations: boolean;
}

export default function TopNav({
  onCheck,
  onResetClasses,
  copyURL,
  useAbbreviations,
}: TopNavProps) {
  const isMobile = useIsMobile();
  const [showMobileSettings, setShowMobileSettings] = useState<boolean>(false);

  return (
    <>
      <div className="topnav">
        {/* logo */}
        <img className="logo" src="/logo.svg" />
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }} className="gpa-page-button">
            <div
              style={{
                background: "var(--error)",
                borderRadius: "16px",
                height: "20px",
                lineHeight: "20px",
                fontSize: "14px",
                fontWeight: "600",
                padding: "0 8px",
                color: "white",
              }}
            >
              NEW
            </div>

            <Link to="/gradecalculator">
              <h2>Grade & GPA Calculator</h2>
            </Link>
          </div>
        )}

        {/* mobile settings toggle button */}
        {isMobile && (
          <>
            <button
              onClick={() => setShowMobileSettings(!showMobileSettings)}
              className="mobile-options-button"
            ></button>
          </>
        )}
        {/* mobile settings modal */}
        {showMobileSettings && (
          <div className="mobile-settings-wrapper" onClick={() => setShowMobileSettings(false)}>
            <div
              className="container mobile-settings
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
                Reset Classes
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
                Print Your Plan
              </button>
            </div>
          </div>
        )}
        {/* desktop buttons */}
        {!isMobile && (
          <>
            <div style={{ marginLeft: "auto" }}></div>
            <div className="topnav-buttons">
              <button className="white abbreviations" onClick={() => onCheck(true)}>
                {useAbbreviations ? "Show Full Course Names" : "Abbreviate Course Names"}
              </button>

              <button className="red reset" onClick={() => onResetClasses()}>
                Reset Classes
              </button>
              <button className="blue copyurl" onClick={() => copyURL()}>
                Copy URL for Your Plan
              </button>
              <button className="blue print" onClick={() => window.print()}>
                Print Your Plan
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
