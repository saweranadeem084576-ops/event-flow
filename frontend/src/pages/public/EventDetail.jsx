import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getEvent } from "../../api/events";
import { getEventReviews, createReview } from "../../api/reviews";
import { createCheckoutSession } from "../../api/payments";
import { categoryBadge, statusBadge } from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";

const categoryIcons = {
  conference: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  seminar: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  workshop: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  concert: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  ),
  exhibition: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
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
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  wedding: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  other: (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
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
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function Stars({ rating }) {
  return (
    <span style={{ color: "var(--gold)", fontSize: 14 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ opacity: i <= rating ? 1 : 0.25 }}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookModal, setBookModal] = useState(false);
  const [tickets, setTickets] = useState(1);
  const [ticketType, setTicketType] = useState("general");
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [bookError, setBookError] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    Promise.all([
      getEvent(id),
      getEventReviews(id).catch(() => ({ data: { data: { reviews: [] } } })),
    ])
      .then(([evRes, rvRes]) => {
        setEvent(evRes.data.data.event || evRes.data.data.data);
        setReviews(rvRes.data.data.reviews || rvRes.data.data.data || []);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (authLoading) return;
    if (!user) {
      navigate("/login");
      return;
    }
    setBooking(true);
    setBookError("");
    try {
      const res = await createCheckoutSession(id, tickets);
      if (res.data.free) {
        // Free event — booked directly
        setBooked(true);
        setBookModal(false);
        return;
      }
      // Redirect to Stripe Checkout
      window.location.href = res.data.url;
    } catch (err) {
      setBookError(err.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await createReview(id, reviewForm);
      setReviews((r) => [res.data.data.review || res.data.data.data, ...r]);
      setReviewForm({ rating: 5, comment: "" });
    } catch {}
    setSubmittingReview(false);
  };

  if (loading)
    return (
      <div className="loading-page">
        <Spinner size="lg" />
      </div>
    );
  if (!event)
    return (
      <div className="empty-state">
        <h3>Event not found</h3>
      </div>
    );

  const totalPrice = (event.price || 0) * tickets;

  return (
    <div style={{ minHeight: "100vh" }}>
      <header className="topbar-public">
        <div className="topbar-public__brand">
          <div className="topbar-public__brand-mark">EF</div>
          <span className="topbar-public__brand-name">EventFlow</span>
        </div>
        <nav className="topbar-public__nav">
          <Link to="/events">← All Events</Link>
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
            <Link
              to="/login"
              className="btn btn--primary btn--sm"
              style={{ marginLeft: 8 }}
            >
              Sign in
            </Link>
          )}
        </nav>
      </header>

      <div style={{ maxWidth: "80%", margin: "0 auto", padding: "40px 24px" }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          {categoryBadge(event.category)}
          {statusBadge(event.status)}
        </div>

        <h1 style={{ marginBottom: 16 }}>{event.title}</h1>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 20,
            marginBottom: 32,
            fontSize: 14,
            color: "var(--ink-3)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {formatDate(event.date)}
            {event.time && ` · ${event.time}`}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            {event.location}
          </span>
          {event.ratingsQuantity > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Stars rating={Math.round(event.ratingsAverage)} />
              {event.ratingsAverage.toFixed(1)} ({event.ratingsQuantity}{" "}
              reviews)
            </span>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 280px",
            gap: 32,
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                background: "var(--bg-sunken)",
                borderRadius: "var(--radius-lg)",
                height: 280,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 28,
                overflow: "hidden",
              }}
            >
              {event.image && event.image !== "default-event.jpg" ? (
                <img
                  src={
                    event.image.startsWith("http")
                      ? event.image
                      : `/img/events/${event.image}`
                  }
                  alt={event.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <div style={{ opacity: 0.3, color: "var(--ink-3)" }}>
                  {categoryIcons[event.category] || categoryIcons.other}
                </div>
              )}
            </div>

            <h3 style={{ marginBottom: 12 }}>About this event</h3>
            <p
              style={{
                color: "var(--ink-2)",
                lineHeight: 1.7,
                marginBottom: 32,
              }}
            >
              {event.description}
            </p>

            <div className="divider" />
            <h3 style={{ margin: "24px 0 16px" }}>
              Reviews ({reviews.length})
            </h3>
            {reviews.length === 0 && (
              <p style={{ color: "var(--ink-4)", fontSize: 13.5 }}>
                No reviews yet. Be the first!
              </p>
            )}
            {reviews.map((r) => (
              <div
                key={r._id}
                style={{
                  padding: "14px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 6,
                  }}
                >
                  <span className="avatar avatar--sm">
                    {r.user?.name?.[0] || "?"}
                  </span>
                  <span style={{ fontWeight: 500, fontSize: 13.5 }}>
                    {r.user?.name}
                  </span>
                  <Stars rating={r.rating} />
                </div>
                <p style={{ fontSize: 13.5, color: "var(--ink-2)" }}>
                  {r.comment}
                </p>
              </div>
            ))}

            {user && (
              <form onSubmit={handleReview} style={{ marginTop: 20 }}>
                <h4 style={{ marginBottom: 12 }}>Leave a review</h4>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <select
                    className="form-select"
                    value={reviewForm.rating}
                    onChange={(e) =>
                      setReviewForm((f) => ({
                        ...f,
                        rating: Number(e.target.value),
                      }))
                    }
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} star{n !== 1 && "s"}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Comment</label>
                  <textarea
                    className="form-textarea"
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((f) => ({ ...f, comment: e.target.value }))
                    }
                    placeholder="Share your experience…"
                    required
                  />
                </div>
                <button
                  className="btn btn--ghost btn--sm"
                  disabled={submittingReview}
                >
                  {submittingReview ? <Spinner size="sm" /> : "Submit review"}
                </button>
              </form>
            )}
          </div>

          <div className="card" style={{ position: "sticky", top: 80 }}>
            <div
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 28,
                fontWeight: 500,
                marginBottom: 4,
              }}
            >
              {event.price === 0 ? "Free" : `$${event.price}`}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "var(--ink-4)",
                marginBottom: 20,
              }}
            >
              per ticket · {event.availableSeats} seats available
            </div>
            {booked ? (
              <div className="alert alert--success" style={{ margin: 0 }}>
                Booked! Check{" "}
                <Link
                  to="/bookings"
                  style={{ color: "var(--accent-ink)", fontWeight: 500 }}
                >
                  My Bookings
                </Link>
                .
              </div>
            ) : (
              <button
                className="btn btn--accent"
                style={{ width: "100%" }}
                disabled={
                  event.status !== "approved" ||
                  event.availableSeats === 0 ||
                  authLoading
                }
                onClick={() => {
                  if (authLoading) return;
                  user ? setBookModal(true) : navigate("/login");
                }}
              >
                {event.availableSeats === 0 ? "Sold out" : "Book now"}
              </button>
            )}
          </div>
        </div>
      </div>

      {bookModal && (
        <Modal
          title="Book tickets"
          onClose={() => setBookModal(false)}
          footer={
            <>
              <button
                className="btn btn--ghost"
                onClick={() => setBookModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn--accent"
                onClick={handleBook}
                disabled={booking}
              >
                {booking ? (
                  <Spinner size="sm" />
                ) : event?.price === 0 ? (
                  "Confirm free booking"
                ) : (
                  `Pay $${(event?.price || 0) * tickets} with Stripe`
                )}
              </button>
            </>
          }
        >
          {bookError && <div className="alert alert--danger">{bookError}</div>}
          <div className="form-group">
            <label className="form-label">Ticket type</label>
            <select
              className="form-select"
              value={ticketType}
              onChange={(e) => setTicketType(e.target.value)}
            >
              <option value="general">General</option>
              <option value="vip">VIP</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Number of tickets</label>
            <input
              className="form-input"
              type="number"
              min="1"
              max={event.availableSeats}
              value={tickets}
              onChange={(e) => setTickets(Number(e.target.value))}
            />
          </div>
          {event.price > 0 && (
            <div
              style={{
                background: "var(--bg-sunken)",
                borderRadius: "var(--radius)",
                padding: "12px 16px",
                fontSize: 14,
              }}
            >
              <div className="flex-between">
                <span className="muted">Subtotal</span>
                <span>${totalPrice}</span>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
