import { useEffect, useState } from "react";
import { getMyTickets } from "../../api/tickets";
import { Badge } from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const typeVariant = { general: "gray", vip: "gold", premium: "info" };

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTickets()
      .then((res) =>
        setTickets(res.data.data.tickets || res.data.data.data || []),
      )
      .catch(() => setTickets([]))
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
        <h1>My Tickets</h1>
        <p>Your tickets for upcoming and past events.</p>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state">
          <h3>No tickets yet</h3>
          <p>Book an event to get your tickets.</p>
        </div>
      ) : (
        <div className="grid-2" style={{ gap: 16 }}>
          {tickets.map((t) => (
            <div key={t._id} className="ticket-card">
              <div className="ticket-card__event">
                {t.event?.title || "Event"}
              </div>
              <div className="ticket-card__meta">
                <span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  {t.event?.date ? formatDate(t.event.date) : "—"}
                </span>
                <span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  >
                    <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  {t.event?.location || "—"}
                </span>
                <span>Issued {formatDate(t.issueDate || t.createdAt)}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Badge variant={typeVariant[t.ticketType] || "gray"}>
                  {t.ticketType}
                </Badge>
                <span className="ticket-card__id">
                  {t._id?.slice(-8).toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
