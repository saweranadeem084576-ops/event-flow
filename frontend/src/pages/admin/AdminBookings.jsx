import { useEffect, useState } from "react";
import { getAllBookings } from "../../api/bookings";
import { statusBadge } from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllBookings()
      .then((res) =>
        setBookings(res.data.data.bookings || res.data.data.data || []),
      )
      .catch(() => setBookings([]))
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
        <h1>Bookings</h1>
        <p>{bookings.length} bookings across all events.</p>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Event</th>
                <th>Tickets</th>
                <th>Amount</th>
                <th>Booked On</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13.5 }}>
                      {b.user?.name || "—"}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-4)" }}>
                      {b.user?.email}
                    </div>
                  </td>
                  <td>
                    <div className="booking-row-event">
                      {b.event?.title || "—"}
                    </div>
                    <div className="booking-row-meta">{b.event?.location}</div>
                  </td>
                  <td>{b.numberOfTickets}</td>
                  <td>
                    <span className="mono">${b.totalPrice}</span>
                  </td>
                  <td className="muted">
                    {formatDate(b.bookingDate || b.createdAt)}
                  </td>
                  <td>{statusBadge(b.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
