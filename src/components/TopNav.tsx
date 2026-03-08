import { useState } from "react";
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
  const [showMobileSettings, setShowMobileSettings] = useState<boolean>(false);

  return (
    <>
      <div className="topnav">
        {isMobile && (
          <>
            <button
              onClick={() => setShowMobileSettings(!showMobileSettings)}
              className="mobile-options-button"
            ></button>
          </>
        )}
        {/* logos */}
        <div className="logo-container">
          {/* <Link to="/courseplanner" style={{}}> */}
          <img className="logo" src="/logo.svg" />
          {/* </Link> */}
        </div>

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
                className="gray"
                onClick={() => {
                  setShowMobileSettings(false);
                }}
              >
                Close
              </button>
              <button
                className="gray"
                onClick={() => {
                  onCheck(true);
                  setShowMobileSettings(false);
                }}
              >
                {useAbbreviations ? "Show Full Course Names" : "Abbreviate Course Names"}
              </button>

              <button
                className="gray"
                onClick={() => {
                  onResetClasses();
                  setShowMobileSettings(false);
                }}
              >
                Reset
              </button>
              <button className="gray" onClick={() => { copyURL(); setShowMobileSettings(false); }} > Copy URL for Your Plan </button>
              <button className="gray" onClick={() => window.print()}> Print </button>
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

              <button className="reset" onClick={() => onResetClasses()}>
                Reset
              </button>
              <button className="copyurl" onClick={() => copyURL()}> Copy URL for Your Plan </button>
              <button className="print" onClick={() => window.print()}> Print </button>
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
