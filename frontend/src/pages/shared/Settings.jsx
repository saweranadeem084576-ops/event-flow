import { useAuth } from "../../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Account preferences and configuration.</p>
      </div>

      <div className="profile-section">
        <h3>Account</h3>
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              padding: "14px 0",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 500, fontSize: 13.5 }}>Name</div>
              <div style={{ color: "var(--ink-4)", fontSize: 13 }}>
                {user?.name}
              </div>
            </div>
          </div>
          <div
            style={{
              padding: "14px 0",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 500, fontSize: 13.5 }}>Email</div>
              <div style={{ color: "var(--ink-4)", fontSize: 13 }}>
                {user?.email}
              </div>
            </div>
          </div>
          <div
            style={{
              padding: "14px 0",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 500, fontSize: 13.5 }}>Role</div>
              <div
                style={{
                  color: "var(--ink-4)",
                  fontSize: 13,
                  textTransform: "capitalize",
                }}
              >
                {user?.role}
              </div>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--ink-4)", marginTop: 20 }}>
          To update your name, email, or password, go to your{" "}
          <a href="/profile" style={{ color: "var(--accent)" }}>
            Profile page
          </a>
          .
        </p>
      </div>
    </div>
  );
}
