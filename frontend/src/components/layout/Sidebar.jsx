import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logout } from "../../api/auth";

const BACKEND = import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "";

const icons = {
  home: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    >
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </svg>
  ),
  calendar: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  ticket: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    >
      <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a3 3 0 0 0 0 6v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a3 3 0 0 0 0-6zM13 5v14" />
    </svg>
  ),
  bell: (
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
  ),
  users: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  settings: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </svg>
  ),
  file: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    >
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5" />
    </svg>
  ),
  chart: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18M7 14l4-4 4 4 5-6" />
    </svg>
  ),
  plus: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  logout: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
};

const userNav = [
  { section: "Main" },
  { to: "/dashboard", label: "Dashboard", icon: "home" },
  { to: "/bookings", label: "My Bookings", icon: "calendar" },
  { to: "/tickets", label: "My Tickets", icon: "ticket" },
  { to: "/notifications", label: "Notifications", icon: "bell" },
  { section: "Account" },
  { to: "/profile", label: "Profile", icon: "users" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

const organizerNav = [
  { section: "Manage" },
  { to: "/dashboard", label: "Dashboard", icon: "home" },
  { to: "/my-events", label: "My Events", icon: "calendar" },
  { to: "/events/create", label: "Create Event", icon: "plus" },
  { to: "/notifications", label: "Notifications", icon: "bell" },
  { section: "Account" },
  { to: "/profile", label: "Profile", icon: "users" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

const adminNav = [
  { section: "Platform" },
  { to: "/dashboard", label: "Dashboard", icon: "home" },
  { to: "/admin/users", label: "Users", icon: "users" },
  { to: "/admin/events", label: "Events", icon: "calendar" },
  { to: "/admin/bookings", label: "Bookings", icon: "ticket" },
  { section: "Account" },
  { to: "/profile", label: "Profile", icon: "users" },
  { to: "/settings", label: "Settings", icon: "settings" },
];

function getNav(role) {
  if (role === "organizer") return organizerNav;
  if (role === "admin") return adminNav;
  return userNav; // attendee and any unknown roles
}

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {}
    signOut();
    navigate("/login");
  };

  const nav = getNav(user?.role);
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

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark">EF</div>
        <span className="sidebar__brand-name">EventFlow</span>
      </div>

      <nav className="sidebar__nav">
        {nav.map((item, i) => {
          if (item.section) {
            return (
              <div key={i} className="sidebar__section">
                {item.section}
              </div>
            );
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar__item${isActive ? " active" : ""}`
              }
            >
              {icons[item.icon]}
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar__footer">
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
        <div className="sidebar__footer-info">
          <div className="sidebar__footer-name">{user?.name}</div>
          <div className="sidebar__footer-role">{user?.role}</div>
        </div>
        <button className="icon-btn" onClick={handleLogout} title="Sign out">
          {icons.logout}
        </button>
      </div>
    </aside>
  );
}
