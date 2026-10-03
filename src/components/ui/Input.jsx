import React from "react";

function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
}) {
  return (
    <div style={{ marginBottom: "20px", display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.2em",
            color: "var(--c-taupe)",
            fontWeight: 600,
          }}
        >
          {label}
        </label>
      )}

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "10px 0",
          border: "none",
          borderBottom: "1px solid var(--c-taupe-40)",
          background: "transparent",
          color: "var(--c-dark)",
          fontSize: "15px",
          outline: "none",
        }}
      />
    </div>
  );
}

export default Input;