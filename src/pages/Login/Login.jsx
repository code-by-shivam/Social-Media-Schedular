import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import Logo from "../../components/common/Logo";
import "./Login.css";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const [email, setEmail] = useState(
    import.meta.env.DEV ? "admin@socialpilot.com" : ""
  );
  const [password, setPassword] = useState(
    import.meta.env.DEV ? "admin123" : ""
  );

  const navigate = useNavigate();
  const { login } = useAuth();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-canvas">
      <div className="login-visual-pane">
        <img
          src="/biking-over-bridge.jpg"
          alt="Biking over bridge editorial visual"
          className="pane-hero-img"
        />

        <div className="visual-overlay-shade"></div>

        <div className="visual-top-bar">
          <Logo variant="light" size="large" />
        </div>

        <div className="visual-quote-container">
          <span className="quote-tag">EDITORIAL ARCHITECTURE</span>

          <h2 className="quote-heading font-serif">
            "Quiet authority is built through deliberate, rhythmically scheduled
            media."
          </h2>

          <div className="quote-author font-mono">
            <span>STUDIO PARADIGM</span> — <span>ISSUE 04</span>
          </div>
        </div>
      </div>

      <div className="login-form-pane">
        <div className="form-inner">
          <div className="form-header">
            <span className="form-eyebrow font-mono">WORKSPACE ACCESS</span>

            <h1 className="form-title font-serif">Sign in to your Studio</h1>

            <p className="form-subtext">
              Enter your credentials to manage your connected platforms and
              queued media.
            </p>
          </div>

          <form className="sp-minimal-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label font-mono">EMAIL ADDRESS</label>

              <div className="input-hairline-box">
                <Mail size={16} className="field-icon" />

                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bare-input"
                />
              </div>
            </div>

            <div className="field-group">
              <div className="label-row">
                <label className="field-label font-mono">SECURITY PASSWORD</label>

                <a href="#forgot" className="forgot-link font-mono">
                  RECOVER?
                </a>
              </div>

              <div className="input-hairline-box">
                <Lock size={16} className="field-icon" />

                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bare-input"
                />
              </div>
            </div>

            {error && (
              <p
                style={{
                  color: "#dc2626",
                  marginBottom: "1rem",
                  fontSize: "14px",
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="sp-primary-submit"
              disabled={loading}
            >
              <span>
                {loading ? "Signing In..." : "Access Dashboard"}
              </span>

              <ArrowRight size={16} />
            </button>
          </form>

          <div className="form-footer-strip hairline-t">
            <span className="footer-prompt">New to SP Studio?</span>

            <Link
              to="/register"
              className="register-link font-mono"
            >
              CREATE WORKSPACE ACCOUNT →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
