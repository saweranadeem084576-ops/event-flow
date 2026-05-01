import { useState, useRef, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../api/auth";

const BACKEND = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "";

const crumbMap = {
  "/dashboard": ["Dashboard"],
  "/bookings": ["My Bookings"],
  "/tickets": ["My Tickets"],
  "/notifications": ["Notifications"],
  "/profile": ["Profile"],
  "/settings": ["Settings"],
  "/my-events": ["My Events"],
  "/events/create": ["Events", "Create"],
  "/admin/users": ["Admin", "Users"],
  "/admin/events": ["Admin", "Events"],
  "/admin/bookings": ["Admin", "Bookings"],
};

export default function Topbar({ onSearch }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  const path = location.pathname;
  const crumbs = crumbMap[path] || [path.replace("/", "")];
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "??";

  const photoSrc =
    user?.photo && user.photo !== "default.jpg"
      ? `${BACKEND}/img/users/${user.photo}`
      : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e) => {
    setQuery(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleLogout = async () => {
    setDropOpen(false);
    try {
      await logout();
    } catch {}
    signOut();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="topbar__crumbs">
        <span>EventFlow</span>
        <span className="sep">/</span>
        {crumbs.map((c, i) => (
          <span key={i} className={i === crumbs.length - 1 ? "current" : ""}>
            {c}
          </span>
        ))}
      </div>

      <div className="topbar__search">
        <svg
          className="search-icon"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search events…"
          value={query}
          onChange={handleSearch}
        />
      </div>

      <div className="topbar__right">
        <Link to="/notifications" className="icon-btn">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />
          </svg>
        </Link>

        {/* Profile dropdown */}
        <div className="profile-dropdown" ref={dropRef}>
          <button
            className="user-chip"
            onClick={() => setDropOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={dropOpen}
          >
            {photoSrc ? (
              <img
                src={photoSrc}
                alt={user?.name}
                className="avatar avatar--emerald"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <span className="avatar avatar--emerald">{initials}</span>
            )}
            <span className="user-chip__name">{user?.name?.split(" ")[0]}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              style={{
                transform: dropOpen ? "rotate(180deg)" : "none",
                transition: "transform .2s",
              }}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {dropOpen && (
            <div className="profile-dropdown__menu">
              <div className="profile-dropdown__header">
                {photoSrc ? (
                  <img
                    src={photoSrc}
                    alt={user?.name}
                    className="avatar avatar--lg avatar--emerald"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <span className="avatar avatar--lg avatar--emerald">
                    {initials}
                  </span>
                )}
                <div>
                  <div className="profile-dropdown__name">{user?.name}</div>
                  <div className="profile-dropdown__role">{user?.role}</div>
                </div>
              </div>
              <div className="profile-dropdown__divider" />
              <Link
                to="/profile"
                className="profile-dropdown__item"
                onClick={() => setDropOpen(false)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                </svg>
                Profile
              </Link>
              <Link
                to="/settings"
                className="profile-dropdown__item"
                onClick={() => setDropOpen(false)}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
                </svg>
                Settings
              </Link>
              <div className="profile-dropdown__divider" />
              <button
                className="profile-dropdown__item profile-dropdown__item--danger"
                onClick={handleLogout}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
