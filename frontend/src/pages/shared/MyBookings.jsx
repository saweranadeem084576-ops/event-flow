import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBookings, cancelBooking } from "../../api/bookings";
import { statusBadge } from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    getMyBookings()
      .then((res) =>
        setBookings(res.data.data.bookings || res.data.data.data || []),
      )
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await cancelBooking(id);
      setBookings((bs) =>
        bs.map((b) => (b._id === id ? { ...b, status: "cancelled" } : b)),
      );
    } catch {}
    setCancelling(null);
  };

  if (loading)
    return (
      <div className="loading-page">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Bookings</h1>
        <p>All your event bookings in one place.</p>
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
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Tickets</th>
                  <th>Amount</th>
                  <th>Booked On</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <div className="booking-row-event">
                        <Link to={`/events/${b.event?._id}`}>
                          {b.event?.title || "—"}
                        </Link>
                      </div>
                    </td>
                    <td className="muted">
                      {b.event?.date ? formatDate(b.event.date) : "—"}
                    </td>
                    <td className="muted">{b.event?.location || "—"}</td>
                    <td>{b.numberOfTickets}</td>
                    <td>
                      <span className="mono">${b.totalPrice}</span>
                    </td>
                    <td className="muted">
                      {formatDate(b.bookingDate || b.createdAt)}
                    </td>
                    <td>{statusBadge(b.status)}</td>
                    <td>
                      {b.status === "pending" || b.status === "confirmed" ? (
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() => handleCancel(b._id)}
                          disabled={cancelling === b._id}
                        >
                          {cancelling === b._id ? (
                            <Spinner size="sm" />
                          ) : (
                            "Cancel"
                          )}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
