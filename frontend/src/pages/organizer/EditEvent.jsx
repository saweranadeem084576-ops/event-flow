import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getEvent, updateEvent } from "../../api/events";
import Spinner from "../../components/ui/Spinner";

const CATEGORIES = [
  "conference",
  "workshop",
  "concert",
  "exhibition",
  "seminar",
  "meetup",
  "wedding",
  "other",
];

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getEvent(id)
      .then((res) => {
        const e = res.data.data.event || res.data.data.data;
        const dateStr = e.date ? e.date.slice(0, 10) : "";
        setForm({
          title: e.title || "",
          description: e.description || "",
          date: dateStr,
          time: e.time || "",
          location: e.location || "",
          price: e.price ?? "",
          availableSeats: e.availableSeats ?? "",
          category: e.category || "other",
        });
      })
      .catch(() => setError("Failed to load event"))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("image", image);
      await updateEvent(id, fd);
      navigate("/my-events");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update event");
    } finally {
      setSaving(false);
    }
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
        <h1>Edit Event</h1>
        <p>Update the details for your event.</p>
      </div>

      <div className="card">
        {error && (
          <div className="alert alert--danger" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}
        {form && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                type="text"
                value={form.title}
                onChange={set("title")}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input form-textarea"
                value={form.description}
                onChange={set("description")}
                required
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.date}
                  onChange={set("date")}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input
                  className="form-input"
                  type="time"
                  value={form.time}
                  onChange={set("time")}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                className="form-input"
                type="text"
                value={form.location}
                onChange={set("location")}
                required
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={set("price")}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Available Seats</label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  value={form.availableSeats}
                  onChange={set("availableSeats")}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-input form-select"
                value={form.category}
                onChange={set("category")}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Replace Image (optional)</label>
              <input
                className="form-input"
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button
                className="btn btn--primary"
                type="submit"
                disabled={saving}
              >
                {saving ? <Spinner size="sm" /> : "Save Changes"}
              </button>
              <button
                className="btn btn--ghost"
                type="button"
                onClick={() => navigate("/my-events")}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
