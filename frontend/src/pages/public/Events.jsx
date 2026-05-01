import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getEvents } from "../../api/events";
import { categoryBadge } from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";

const PAGE_SIZE = 9;

const CATEGORIES = [
  "All",
  "conference",
  "concert",
  "workshop",
  "exhibition",
  "meetup",
  "wedding",
  "seminar",
  "other",
];

const SORT_OPTIONS = [
  { value: "date", label: "Date: upcoming first" },
  { value: "-date", label: "Date: latest first" },
  { value: "price", label: "Price: low to high" },
  { value: "-price", label: "Price: high to low" },
  { value: "-ratingsAverage", label: "Top rated" },
];

const categoryIcons = {
  conference: (
    <svg
      width="16"
      height="16"
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
  concert: (
    <svg
      width="16"
      height="16"
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
  workshop: (
    <svg
      width="16"
      height="16"
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
  exhibition: (
    <svg
      width="16"
      height="16"
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
  meetup: (
    <svg
      width="16"
      height="16"
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
  wedding: (
    <svg
      width="16"
      height="16"
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
  seminar: (
    <svg
      width="16"
      height="16"
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
  other: (
    <svg
      width="16"
      height="16"
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
};

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function EventCard({ event }) {
  const navigate = useNavigate();
  const isFree = event.price === 0;
  return (
    <div
      className="event-card"
      onClick={() => navigate(`/events/${event._id}`)}
    >
      <div className="event-card__img-wrap">
        {event.image && event.image !== "default-event.jpg" ? (
          <img
            src={
              event.image.startsWith("http")
                ? event.image
                : `/img/events/${event.image}`
            }
            alt={event.title}
            loading="lazy"
          />
        ) : (
          <div className="event-card__img-placeholder">
            {categoryIcons[event.category] || categoryIcons.other}
          </div>
        )}
        {isFree && <div className="event-card__free-badge">Free</div>}
      </div>
      <div className="event-card__body">
        <div style={{ marginBottom: 6 }}>{categoryBadge(event.category)}</div>
        <div className="event-card__title">{event.title}</div>
        <div className="event-card__meta">
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
      </div>
      <div className="event-card__footer">
        <div className="event-card__price">
          {isFree ? "Free" : `PKR ${event.price.toLocaleString()}`}
        </div>
        <div className="event-card__seats">
          {event.availableSeats} seats left
        </div>
      </div>
    </div>
  );
}

function Pagination({ page, total, onPage }) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);
  return (
    <div className="pagination">
      <button
        className="pagination__btn"
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`pagination__btn${p === page ? " active" : ""}`}
          onClick={() => onPage(p)}
        >
          {p}
        </button>
      ))}
      <button
        className="pagination__btn"
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date");
  const [onlyFree, setOnlyFree] = useState(false);
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const category = searchParams.get("category") || "All";

  // Reset page when filters/search changes
  useEffect(() => {
    setPage(1);
  }, [category, search, sort, onlyFree]);
  const handleSetCategory = (c) => {
    if (c === "All") setSearchParams({});
    else setSearchParams({ category: c });
    setPage(1);
  };

  useEffect(() => {
    setLoading(true);
    let cancelled = false;
    const timer = setTimeout(
      () => {
        const params = { sort, limit: PAGE_SIZE, page };
        if (category !== "All") params.category = category;
        if (search) params.search = search;
        if (onlyFree) params.price = 0;
        getEvents(params)
          .then((res) => {
            if (cancelled) return;
            const data = res.data;
            setEvents(data.data.data || data.data.events || []);
            setTotal(
              data.totalPages ? data.totalPages * PAGE_SIZE : data.results || 0,
            );
            setLoading(false);
          })
          .catch(() => {
            if (!cancelled) {
              setEvents([]);
              setTotal(0);
              setLoading(false);
            }
          });
      },
      search ? 350 : 0,
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [category, search, sort, onlyFree, page]);

  const activeFilters =
    (category !== "All" ? 1 : 0) +
    (onlyFree ? 1 : 0) +
    (sort !== "date" ? 1 : 0) +
    (search ? 1 : 0);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header className="topbar-public">
        <div className="topbar-public__brand">
          <div className="topbar-public__brand-mark">EF</div>
          <span className="topbar-public__brand-name">EventFlow</span>
        </div>
        <nav className="topbar-public__nav">
          <Link to="/">Home</Link>
          {user ? (
            <Link
              to="/dashboard"
              className="btn btn--accent btn--sm"
              style={{ marginLeft: 8 }}
            >
              Dashboard
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

      <div className="events-page">
        <div className="events-page__hero">
          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Explore
          </div>
          <h1>All Events</h1>
          <p>Find and book events across Pakistan</p>
        </div>

        <div className="events-page__body">
          <div className="events-filters">
            <div className="events-filters__search">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search events by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="events-filters__clear"
                  onClick={() => setSearch("")}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="events-filters__controls">
              <select
                className="events-filters__select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>

              <button
                className={`events-filters__toggle${onlyFree ? " active" : ""}`}
                onClick={() => setOnlyFree((v) => !v)}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Free only
              </button>

              {activeFilters > 0 && (
                <button
                  className="events-filters__reset"
                  onClick={() => {
                    setSearchParams({});
                    setSearch("");
                    setSort("date");
                    setOnlyFree(false);
                    setPage(1);
                  }}
                >
                  Clear filters
                  <span className="events-filters__count">{activeFilters}</span>
                </button>
              )}
            </div>
          </div>

          <div className="events-cats">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                className={`tag${category === c ? " active" : ""}`}
                onClick={() => handleSetCategory(c)}
              >
                {c === "All" ? "All" : c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-page">
              <Spinner size="lg" />
            </div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                style={{ opacity: 0.3, marginBottom: 12 }}
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <h3>No events found</h3>
              <p>Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <>
              <div className="events-meta">
                Showing <strong>{events.length}</strong> event
                {events.length !== 1 ? "s" : ""}
                {total > PAGE_SIZE && (
                  <span>
                    {" "}
                    of <strong>{total}</strong>
                  </span>
                )}
              </div>
              <div className="event-grid">
                {events.map((e) => (
                  <EventCard key={e._id} event={e} />
                ))}
              </div>
              <Pagination page={page} total={total} onPage={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
