import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyBookings } from "../../api/bookings";
import { getMyEvents, getEventStats } from "../../api/events";
import { getAllBookings } from "../../api/bookings";
import { getAllUsers } from "../../api/auth";
import { statusBadge, categoryBadge } from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function StatCard({ title, value, sub }) {
  return (
    <div className="card">
      <div className="card__title">{title}</div>
      <div className="card__value">{value}</div>
      {sub && <div className="card__sub">{sub}</div>}
    </div>
  );
}

function UserDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBookings()
      .then((res) =>
        setBookings(res.data.data.bookings || res.data.data.data || []),
      )
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const confirmed = bookings.filter((b) => b.status === "confirmed").length;
  const pending = bookings.filter((b) => b.status === "pending").length;
  const upcoming = bookings.filter(
    (b) => b.event && new Date(b.event.date) > new Date(),
  ).length;

  if (loading)
    return (
      <div className="loading-page">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="page">
      <div className="page-header">
        <div className="eyebrow">Attendee</div>
        <h1>My Dashboard</h1>
        <p>Welcome back. Here&apos;s what&apos;s happening with your events.</p>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Bookings" value={bookings.length} />
        <StatCard title="Confirmed" value={confirmed} />
        <StatCard title="Pending" value={pending} />
        <StatCard title="Upcoming" value={upcoming} />
      </div>

      <div className="card">
        <div className="flex-between mb-16">
          <h3>Recent Bookings</h3>
          <Link to="/bookings" style={{ fontSize: 13, color: "var(--accent)" }}>
            View all
          </Link>
        </div>
        {bookings.length === 0 ? (
          <div className="empty-state">
            <h3>No bookings yet</h3>
            <p>Browse events and make your first booking.</p>
            <Link
              to="/events"
              className="btn btn--accent btn--sm"
              style={{ marginTop: 16 }}
            >
              Browse events
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Tickets</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div className="booking-row-event">
                        {b.event?.title || "—"}
                      </div>
                      <div className="booking-row-meta">
                        {b.event?.location}
                      </div>
                    </td>
                    <td className="muted">
                      {b.event?.date ? formatDate(b.event.date) : "—"}
                    </td>
                    <td>{b.numberOfTickets}</td>
                    <td className="mono">${b.totalPrice}</td>
                    <td>{statusBadge(b.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEvents()
      .then((res) =>
        setEvents(res.data.data.events || res.data.data.data || []),
      )
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const approved = events.filter((e) => e.status === "approved").length;
  const pending = events.filter((e) => e.status === "pending").length;
  const totalSeats = events.reduce((s, e) => s + e.availableSeats, 0);

  if (loading)
    return (
      <div className="loading-page">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="page">
      <div className="page-header flex-between">
        <div>
          <div className="eyebrow">Organizer</div>
          <h1>Dashboard</h1>
          <p>Manage your events and track performance.</p>
        </div>
        <Link to="/events/create" className="btn btn--accent">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create Event
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Events" value={events.length} />
        <StatCard title="Approved" value={approved} />
        <StatCard title="Pending Review" value={pending} />
        <StatCard title="Total Seats" value={totalSeats} />
      </div>

      <div className="card">
        <div className="flex-between mb-16">
          <h3>My Events</h3>
          <Link
            to="/my-events"
            style={{ fontSize: 13, color: "var(--accent)" }}
          >
            View all
          </Link>
        </div>
        {events.length === 0 ? (
          <div className="empty-state">
            <h3>No events yet</h3>
            <p>Create your first event to get started.</p>
            <Link
              to="/events/create"
              className="btn btn--accent btn--sm"
              style={{ marginTop: 16 }}
            >
              Create event
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Seats</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 5).map((e) => (
                  <tr key={e._id}>
                    <td>
                      <div className="booking-row-event">{e.title}</div>
                      <div className="booking-row-meta">{e.location}</div>
                    </td>
                    <td className="muted">{formatDate(e.date)}</td>
                    <td>{categoryBadge(e.category)}</td>
                    <td>{e.availableSeats}</td>
                    <td className="mono">
                      {e.price === 0 ? "Free" : `$${e.price}`}
                    </td>
                    <td>{statusBadge(e.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getEventStats().catch(() => ({ data: { data: [] } })),
      getAllUsers().catch(() => ({ data: { data: { users: [] } } })),
    ])
      .then(([sRes, uRes]) => {
        setStats(sRes.data.data);
        setUsers(uRes.data.data.users || uRes.data.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="loading-page">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="page">
      <div className="page-header">
        <div className="eyebrow">Admin</div>
        <h1>Platform Dashboard</h1>
        <p>Overview of all platform activity.</p>
      </div>

      <div className="stats-grid">
        <StatCard title="Total Users" value={users.length} />
        <StatCard
          title="Organizers"
          value={users.filter((u) => u.role === "organizer").length}
        />
        <StatCard
          title="Categories"
          value={Array.isArray(stats) ? stats.length : "—"}
          sub="event categories"
        />
        <StatCard
          title="Active Users"
          value={users.filter((u) => u.active !== false).length}
        />
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        <div className="card">
          <div className="flex-between mb-16">
            <h3>Recent Users</h3>
            <Link
              to="/admin/users"
              style={{ fontSize: 13, color: "var(--accent)" }}
            >
              View all
            </Link>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 6).map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span className="avatar avatar--sm">{u.name?.[0]}</span>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 13.5 }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--ink-4)" }}>
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{statusBadge(u.role)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Event Statistics</h3>
          {Array.isArray(stats) && stats.length > 0 ? (
            stats.map((s) => (
              <div
                key={s._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {categoryBadge(s._id || "other")}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {s.numEvents} events
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-4)" }}>
                    avg ${s.avgPrice?.toFixed(0)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="muted" style={{ fontSize: 13.5 }}>
              No statistics available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "admin") return <AdminDashboard />;
  if (user?.role === "organizer") return <OrganizerDashboard />;
  return <UserDashboard />;
}
