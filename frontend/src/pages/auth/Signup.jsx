import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";
import Spinner from "../../components/ui/Spinner";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
    role: "attendee",
  });
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

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
      const res = await signup(form);
      if (res.data.status === "pending_otp") {
        localStorage.setItem("preAuthToken", res.data.preAuthToken);
        success("Verification code sent to your email!");
        setTimeout(() => navigate("/verify-otp"), 600);
        return;
      }
      // Fallback
      signIn(res.data.data.user);
      success("Account created! Welcome to EventFlow");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      toastError(
        err.response?.data?.message || "Signup failed. Please try again.",
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
            Join thousands
            <br />
            of event-goers
          </h2>
          <p className="auth-side-sub">
            Create your free account and start discovering events worth
            attending.
          </p>
          <div className="auth-side-steps">
            {[
              { n: "1", label: "Create your free account" },
              { n: "2", label: "Browse hundreds of events" },
              { n: "3", label: "Book instantly & get tickets" },
            ].map((s) => (
              <div key={s.n} className="auth-side-step">
                <span className="auth-side-step__n">{s.n}</span>
                <span className="auth-side-step__label">{s.label}</span>
              </div>
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
            <h1>Create account</h1>
            <p>Join EventFlow — it&apos;s free</p>
          </div>

          <form onSubmit={onSubmit} className="auth-card__form">
            <div className="form-group">
              <label className="form-label">Full name</label>
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
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input
                  className="form-input form-input--icon"
                  type="text"
                  name="name"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={onChange}
                  required
                  autoFocus
                />
              </div>
            </div>

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
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">I want to</label>
              <select
                className="form-select"
                name="role"
                value={form.role}
                onChange={onChange}
              >
                <option value="attendee">Attend events</option>
                <option value="organizer">Organise events</option>
              </select>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Password</label>
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
                    placeholder="Min. 8 chars"
                    value={form.password}
                    onChange={onChange}
                    required
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
            </div>

            <button
              className="btn btn--accent btn--lg auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  Create account
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
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
