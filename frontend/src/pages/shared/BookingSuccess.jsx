import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function BookingSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");

  useEffect(() => {
    // Clear any stale state
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-base)",
        padding: "24px",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          padding: "48px 40px",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "var(--accent-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 style={{ marginBottom: 8 }}>Booking confirmed!</h1>
        <p style={{ color: "var(--ink-3)", marginBottom: 8 }}>
          Your payment was successful and your ticket has been generated.
        </p>
        {sessionId && (
          <p
            style={{
              fontSize: 12,
              color: "var(--ink-4)",
              fontFamily: "monospace",
              marginBottom: 24,
            }}
          >
            Session: {sessionId.slice(0, 30)}…
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            marginTop: 32,
          }}
        >
          <Link to="/bookings" className="btn btn--accent">
            View my bookings
          </Link>
          <Link to="/tickets" className="btn btn--ghost">
            My tickets
          </Link>
        </div>
      </div>
    </div>
  );
}
