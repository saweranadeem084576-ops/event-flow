import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";
import Spinner from "../../components/ui/Spinner";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      if (res.data.status === "pending_otp") {
        localStorage.setItem("preAuthToken", res.data.preAuthToken);
        success("Verification code sent to your email!");
        setTimeout(() => navigate("/verify-otp"), 600);
        return;
      }
      // Fallback (shouldn't happen with new flow)
      signIn(res.data.data.user);
      success("Welcome back! Redirecting…");
      const redirectTo =
        res.data.data.user?.role === "attendee" ? "/" : "/dashboard";
      setTimeout(() => navigate(redirectTo), 800);
    } catch (err) {
      toastError(err.response?.data?.message || "Invalid email or password");
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
            Your next great
            <br />
            event awaits
          </h2>
          <p className="auth-side-sub">
            Discover and book events across Pakistan — conferences, concerts,
            workshops and more.
          </p>
          <div className="auth-side-pills">
            {[
              "Conferences",
              "Concerts",
              "Workshops",
              "Exhibitions",
              "Meetups",
            ].map((c) => (
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
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <form onSubmit={onSubmit} className="auth-card__form">
            <div className="form-group">
              <label className="form-label">Email</label>
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
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={onChange}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Password
                </label>
                <Link to="/forgot-password" className="auth-link-sm">
                  Forgot password?
                </Link>
              </div>
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
                  placeholder="••••••••"
                  value={form.password}
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
                  Sign in
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
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="auth-link">
              Create one free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
