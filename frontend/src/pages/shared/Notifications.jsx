import { useEffect, useState } from "react";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../api/notifications";
import Spinner from "../../components/ui/Spinner";

const typeIcons = {
  event: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  booking: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a3 3 0 0 0 0 6v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a3 3 0 0 0 0-6zM13 5v14" />
    </svg>
  ),
  default: (
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
};

function timeAgo(d) {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyNotifications()
      .then((res) =>
        setItems(res.data.data.notifications || res.data.data.data || []),
      )
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const handleRead = async (id) => {
    await markAsRead(id).catch(() => {});
    setItems((ns) => ns.map((n) => (n._id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAll = async () => {
    await markAllAsRead().catch(() => {});
    setItems((ns) => ns.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = async (id) => {
    await deleteNotification(id).catch(() => {});
    setItems((ns) => ns.filter((n) => n._id !== id));
  };

  if (loading)
    return (
      <div className="loading-page">
        <Spinner size="lg" />
      </div>
    );

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="page">
      <div className="page-header flex-between">
        <div>
          <h1>Notifications</h1>
          <p>
            {unread} unread notification{unread !== 1 && "s"}
          </p>
        </div>
        {unread > 0 && (
          <button className="btn btn--ghost btn--sm" onClick={handleMarkAll}>
            Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <h3>All caught up</h3>
          <p>No notifications to show.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: "4px 20px" }}>
          {items.map((n) => (
            <div
              key={n._id}
              className={`notification-item${!n.read ? " unread" : ""}`}
            >
              <div className="notification-item__icon">
                {typeIcons[n.type] || typeIcons.default}
              </div>
              <div
                className="notification-item__body"
                onClick={() => !n.read && handleRead(n._id)}
                style={{ cursor: !n.read ? "pointer" : "default" }}
              >
                <div className="notification-item__title">
                  {n.title || n.message}
                </div>
                {n.body && (
                  <div className="notification-item__text">{n.body}</div>
                )}
                <div className="notification-item__time">
                  {timeAgo(n.createdAt)}
                </div>
              </div>
              <button
                className="icon-btn"
                onClick={() => handleDelete(n._id)}
                style={{ flexShrink: 0, color: "var(--ink-4)" }}
                title="Remove"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
