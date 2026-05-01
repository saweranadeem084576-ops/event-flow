import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getEvents } from "../../api/events";
import { categoryBadge } from "../../components/ui/Badge";

const CATEGORY_DATA = [
  {
    key: "conference",
    label: "Conference",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    key: "concert",
    label: "Concert",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    key: "workshop",
    label: "Workshop",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    key: "exhibition",
    label: "Exhibition",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    ),
  },
  {
    key: "meetup",
    label: "Meetup",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    key: "wedding",
    label: "Wedding",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    key: "seminar",
    label: "Seminar",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    key: "other",
    label: "Other",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
];

const FEATURES = [
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a3 3 0 0 0 0 6v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a3 3 0 0 0 0-6zM13 5v14" />
      </svg>
    ),
    title: "Instant booking",
    desc: "Book any event in seconds with secure payments and instant ticket delivery.",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: "Powerful organiser tools",
    desc: "Create, manage and track your events with a full dashboard built for organisers.",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
    ),
    title: "Real-time updates",
    desc: "Stay notified about bookings, confirmations, and event changes as they happen.",
  },
  {
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <path d="M1 10h22" />
      </svg>
    ),
    title: "Secure payments",
    desc: "Industry-standard payment processing keeps every transaction safe and smooth.",
  },
];

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function FeaturedCard({ event }) {
  const navigate = useNavigate();
  return (
    <div
      className="featured-card"
      onClick={() => navigate(`/events/${event._id}`)}
    >
      <div className="featured-card__img">
        {event.image && event.image !== "default-event.jpg" ? (
          <img
            src={
              event.image.startsWith("http")
                ? event.image
                : `/img/events/${event.image}`
            }
            alt={event.title}
          />
        ) : (
          <div className="featured-card__img-fallback" />
        )}
        <div className="featured-card__overlay">
          {categoryBadge(event.category)}
        </div>
      </div>
      <div className="featured-card__body">
        <div className="featured-card__title">{event.title}</div>
        <div className="featured-card__meta">
          <span>
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {formatDate(event.date)}
          </span>
          <span>
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            {event.location}
          </span>
        </div>
        <div className="featured-card__price">
          {event.price === 0 ? (
            <span className="featured-card__free">Free</span>
          ) : (
            <span>PKR {event.price.toLocaleString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    getEvents({ status: "approved", limit: 6 })
      .then((res) =>
        setFeatured(res.data.data.events || res.data.data.data || []),
      )
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header className="topbar-public">
        <div className="topbar-public__brand">
          <div className="topbar-public__brand-mark">EF</div>
          <span className="topbar-public__brand-name">EventFlow</span>
        </div>
        <nav className="topbar-public__nav">
          <Link to="/events">Browse Events</Link>
          {user ? (
            <Link
              to="/dashboard"
              className="user-chip"
              style={{ marginLeft: 8, textDecoration: "none" }}
            >
              <span
                className="avatar avatar--emerald"
                style={{ width: 30, height: 30, fontSize: 12 }}
              >
                {user.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "?"}
              </span>
              <span className="user-chip__name">
                {user.name?.split(" ")[0]}
              </span>
            </Link>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link
                to="/signup"
                className="btn btn--accent btn--sm"
                style={{ marginLeft: 4 }}
              >
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="hero">
        <div className="hero__inner">
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            Pakistan&apos;s Event Platform
          </div>
          <h1>
            Discover events
            <br />
            worth attending
          </h1>
          <p>
            Conferences, concerts, workshops &amp; more — find and book the
            events that matter to you.
          </p>
          <div className="hero__actions">
            <button
              className="btn btn--accent btn--lg"
              onClick={() => navigate("/events")}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              Browse events
            </button>
            {!user && (
              <Link to="/signup" className="btn btn--ghost btn--lg">
                Create account →
              </Link>
            )}
          </div>
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-val">12+</span>
              <span className="hero__stat-label">Live events</span>
            </div>
            <div className="hero__stat-sep" />
            <div className="hero__stat">
              <span className="hero__stat-val">8</span>
              <span className="hero__stat-label">Categories</span>
            </div>
            <div className="hero__stat-sep" />
            <div className="hero__stat">
              <span className="hero__stat-val">100%</span>
              <span className="hero__stat-label">Secure booking</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <div className="home-section__inner">
          <div className="home-section__head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>
                Browse by category
              </div>
              <h2>What are you looking for?</h2>
            </div>
            <Link to="/events" className="btn btn--ghost btn--sm">
              See all events →
            </Link>
          </div>
          <div className="category-grid">
            {CATEGORY_DATA.map((c) => (
              <Link
                key={c.key}
                to={`/events?category=${c.key}`}
                className="category-tile"
              >
                <span className="category-tile__icon">{c.icon}</span>
                <span className="category-tile__label">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="home-section home-section--alt">
          <div className="home-section__inner">
            <div className="home-section__head">
              <div>
                <div className="eyebrow" style={{ marginBottom: 6 }}>
                  Upcoming
                </div>
                <h2>Featured events</h2>
              </div>
              <Link to="/events" className="btn btn--ghost btn--sm">
                View all →
              </Link>
            </div>
            <div className="featured-grid">
              {featured.map((e) => (
                <FeaturedCard key={e._id} event={e} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="home-section">
        <div className="home-section__inner">
          <div className="home-section__head">
            <div>
              <div className="eyebrow" style={{ marginBottom: 6 }}>
                Why EventFlow
              </div>
              <h2>Everything you need</h2>
            </div>
          </div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-card__icon">{f.icon}</div>
                <h3 style={{ marginBottom: 6, fontSize: 14.5 }}>{f.title}</h3>
                <p
                  style={{
                    color: "var(--ink-3)",
                    fontSize: 13.5,
                    lineHeight: 1.6,
                  }}
                >
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!user && (
        <section className="home-cta">
          <div className="home-cta__inner">
            <h2>Ready to find your next event?</h2>
            <p>
              Join thousands of people discovering and booking events every day.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: 28,
              }}
            >
              <Link to="/signup" className="btn btn--accent btn--lg">
                Get started for free
              </Link>
              <Link
                to="/events"
                className="btn btn--ghost btn--lg"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "white",
                }}
              >
                Browse events
              </Link>
            </div>
          </div>
        </section>
      )}

      <footer className="home-footer">
        <div className="home-footer__inner">
          <div className="home-footer__brand">
            <div
              className="topbar-public__brand-mark"
              style={{ width: 24, height: 24, fontSize: 11 }}
            >
              EF
            </div>
            <span
              className="topbar-public__brand-name"
              style={{ fontSize: 13 }}
            >
              EventFlow
            </span>
          </div>
          <p style={{ color: "var(--ink-4)", fontSize: 12.5 }}>
            © {new Date().getFullYear()} EventFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
