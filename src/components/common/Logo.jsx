import React from "react";
import "./Logo.css";

function Logo({ variant = "dark", size = "normal" }) {
  return (
    <div className={`sp-logo-container ${variant} ${size}`}>
      <div className="sp-monogram-mark">
        <svg viewBox="0 0 100 100" className="sp-svg-logo" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="2" opacity="0.3" />
          <path
            d="M32 36 C32 28, 44 28, 48 34 C52 40, 32 46, 36 56 C40 66, 52 64, 52 58"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M56 34 L56 66 M56 34 L72 34 C78 34, 78 48, 72 48 L56 48"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="76" cy="62" r="3.5" fill="currentColor" />
        </svg>
      </div>

      <div className="sp-logo-text">
        <span className="sp-brand-name">SP STUDIO</span>
        <span className="sp-brand-tag">SOCIAL PILOT</span>
      </div>
    </div>
  );
}

export default Logo;