import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/auth";
import Spinner from "../../components/ui/Spinner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-layout__side">
        <div className="auth-side-content">
          <div className="auth-brand">
            <div className="auth-brand-mark">EF</div>
            <span className="auth-brand-name">EventFlow</span>
          </div>
          <h2 className="auth-side-heading">
            Reset your
            <br />
            password
          </h2>
          <p className="auth-side-sub">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
          <div className="auth-side-pills">
            {["Secure", "Quick", "Easy"].map((c) => (
              <span key={c} className="auth-side-pill">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-layout__form">
        <div className="auth-card">
          <div className="auth-card__head">
            <div className="auth-brand auth-brand--mobile">
              <div className="auth-brand-mark">EF</div>
              <span className="auth-brand-name">EventFlow</span>
            </div>
            <h1>Forgot password?</h1>
            <p>Enter your email and we&apos;ll send a reset link</p>
          </div>

          {sent ? (
            <div className="auth-card__form">
              <div
                className="alert alert--success"
                style={{ marginBottom: 16 }}
              >
                Check your inbox — a reset link has been sent.
              </div>
              <Link
                to="/login"
                className="btn btn--accent btn--lg auth-submit-btn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="auth-card__form">
              {error && (
                <div
                  className="alert alert--danger"
                  style={{ marginBottom: 16 }}
                >
                  {error}
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Email address</label>
                <div className="form-input-wrap">
                  <span className="form-input-icon">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-10 7L2 7" />
                    </svg>
                  </span>
                  <input
                    className="form-input form-input--icon"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>
              <button
                className="btn btn--accent btn--lg auth-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    Send reset link
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          <div className="auth-card__foot">
            Remember your password?{" "}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
