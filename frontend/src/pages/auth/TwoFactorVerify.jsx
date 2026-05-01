import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { verifyOtp } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";
import Spinner from "../../components/ui/Spinner";

export default function TwoFactorVerify() {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const refs = useRef([]);
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { success, error: toastError } = useToast();

  const preAuthToken = localStorage.getItem("preAuthToken");

  useEffect(() => {
    if (!preAuthToken) navigate("/login", { replace: true });
    refs.current[0]?.focus();
  }, [preAuthToken, navigate]);

  const onDigitChange = (i, val) => {
    const char = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = char;
    setDigits(next);
    if (char && i < 5) refs.current[i + 1]?.focus();
  };

  const onKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const onPaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setDigits(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) {
      toastError("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtp({ preAuthToken, code });
      localStorage.removeItem("preAuthToken");
      signIn(res.data.data.user);
      success("Verified! Redirecting…");
      const redirectTo =
        res.data.data.user?.role === "attendee" ? "/" : "/dashboard";
      setTimeout(() => navigate(redirectTo), 700);
    } catch (err) {
      toastError(err.response?.data?.message || "Invalid or expired code.");
      setDigits(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left panel */}
      <div className="auth-layout__side">
        <div className="auth-side-content">
          <div className="auth-brand">
            <div className="auth-brand-mark">EF</div>
            <span className="auth-brand-name">EventFlow</span>
          </div>
          <h2 className="auth-side-heading">
            Verify your
            <br />
            identity
          </h2>
          <p className="auth-side-sub">
            We sent a 6-digit code to your email. Enter it below to confirm your
            identity and access your account.
          </p>
          <div className="auth-side-pills">
            {["Secure", "Private", "Fast", "Trusted"].map((c) => (
              <span key={c} className="auth-side-pill">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-layout__form">
        <div className="auth-card">
          <div className="auth-card__head">
            <div className="auth-brand auth-brand--mobile">
              <div className="auth-brand-mark">EF</div>
              <span className="auth-brand-name">EventFlow</span>
            </div>
            <h1>Check your inbox</h1>
            <p>Enter the 6-digit code we emailed you</p>
          </div>

          <form onSubmit={onSubmit} className="auth-card__form">
            <div className="otp-input-row" onPaste={onPaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  className="otp-digit-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]"
                  maxLength={1}
                  value={d}
                  onChange={(e) => onDigitChange(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            <button
              className="btn btn--accent btn--lg auth-submit-btn"
              type="submit"
              disabled={loading}
            >
              {loading ? <Spinner size={18} color="#fff" /> : "Verify code"}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>
              Didn&apos;t receive it?{" "}
              <Link to="/login" className="auth-link">
                Go back and try again
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
