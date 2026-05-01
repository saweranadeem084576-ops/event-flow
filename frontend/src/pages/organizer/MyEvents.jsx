import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyEvents, deleteEvent } from "../../api/events";
import { statusBadge, categoryBadge } from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [delTarget, setDelTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getMyEvents()
      .then((res) =>
        setEvents(res.data.data.events || res.data.data.data || []),
      )
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteEvent(delTarget._id);
      setEvents((es) => es.filter((e) => e._id !== delTarget._id));
    } catch {}
    setDeleting(false);
    setDelTarget(null);
  };

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
          <h1>My Events</h1>
          <p>Events you've created as an organizer.</p>
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
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Seats</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e._id}>
                    <td>
                      <div className="booking-row-event">{e.title}</div>
                      <div className="booking-row-meta">{e.location}</div>
                    </td>
                    <td className="muted">{formatDate(e.date)}</td>
                    <td>{categoryBadge(e.category)}</td>
                    <td>{e.availableSeats}</td>
                    <td>
                      <span className="mono">
                        {e.price === 0 ? "Free" : `$${e.price}`}
                      </span>
                    </td>
                    <td>{statusBadge(e.status)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link
                          to={`/events/edit/${e._id}`}
                          className="btn btn--ghost btn--sm"
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn--danger btn--sm"
                          onClick={() => setDelTarget(e)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {delTarget && (
        <Modal onClose={() => setDelTarget(null)}>
          <div slot="head">Delete Event</div>
          <div slot="body">
            <p>
              Are you sure you want to delete <strong>{delTarget.title}</strong>
              ? This action cannot be undone.
            </p>
          </div>
          <div
            slot="foot"
            style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
          >
            <button
              className="btn btn--ghost"
              onClick={() => setDelTarget(null)}
            >
              Cancel
            </button>
            <button
              className="btn btn--danger"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? <Spinner size="sm" /> : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
