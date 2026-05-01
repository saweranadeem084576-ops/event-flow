import { useEffect, useState } from "react";
import { getEvents, approveEvent, deleteEvent } from "../../api/events";
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

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [delTarget, setDelTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [approving, setApproving] = useState(null);

  useEffect(() => {
    getEvents()
      .then((res) =>
        setEvents(res.data.data.events || res.data.data.data || []),
      )
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    setApproving(id);
    try {
      await approveEvent(id);
      setEvents((es) =>
        es.map((e) => (e._id === id ? { ...e, status: "approved" } : e)),
      );
    } catch {}
    setApproving(null);
  };

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
      <div className="page-header">
        <h1>Events</h1>
        <p>
          {events.length} events on the platform. Approve pending events below.
        </p>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Category</th>
                <th>Organizer</th>
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
                  <td className="muted">{e.organizer?.name || "—"}</td>
                  <td>
                    <span className="mono">
                      {e.price === 0 ? "Free" : `$${e.price}`}
                    </span>
                  </td>
                  <td>{statusBadge(e.status)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      {e.status === "pending" && (
                        <button
                          className="btn btn--accent btn--sm"
                          onClick={() => handleApprove(e._id)}
                          disabled={approving === e._id}
                        >
                          {approving === e._id ? (
                            <Spinner size="sm" />
                          ) : (
                            "Approve"
                          )}
                        </button>
                      )}
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

      {delTarget && (
        <Modal onClose={() => setDelTarget(null)}>
          <div slot="head">Delete Event</div>
          <div slot="body">
            <p>
              Delete <strong>{delTarget.title}</strong>? This cannot be undone.
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
