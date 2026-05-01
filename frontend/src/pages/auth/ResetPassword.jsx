import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";
import Spinner from "../../components/ui/Spinner";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { success, error: toastError } = useToast();

  const [form, setForm] = useState({ password: "", passwordConfirm: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      toastError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      toastError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await resetPassword(token, form);
      signIn(res.data.data.user);
      success("Password reset! Redirecting to dashboard…");
      setTimeout(() => navigate("/dashboard"), 800);
    } catch (err) {
      toastError(
        err.response?.data?.message ||
          "Reset failed. The link may have expired.",
      );
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
            Set a new
            <br />
            password
          </h2>
          <p className="auth-side-sub">
            Choose a strong password to protect your account. It must be at
            least 8 characters long.
          </p>
          <div className="auth-side-pills">
            {["Secure", "Private", "Protected"].map((c) => (
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
            <h1>New password</h1>
            <p>Enter and confirm your new password below</p>
          </div>

          <form onSubmit={onSubmit} className="auth-card__form">
            <div className="form-group">
              <label className="form-label">New password</label>
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
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  className="form-input form-input--icon"
                  type="password"
                  name="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={onChange}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm password</label>
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
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <input
                  className="form-input form-input--icon"
                  type="password"
                  name="passwordConfirm"
                  placeholder="••••••••"
                  value={form.passwordConfirm}
                  onChange={onChange}
                  required
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
                  Reset password
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
