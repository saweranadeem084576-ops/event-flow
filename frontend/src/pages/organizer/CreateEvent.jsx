import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createEvent } from "../../api/events";
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

export default function CreateEvent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    price: "",
    availableSeats: "",
    category: "other",
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append("image", image);
      await createEvent(fd);
      navigate("/my-events");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Create Event</h1>
        <p>Fill in the details below to create a new event.</p>
      </div>

      <div className="card">
        {error && (
          <div className="alert alert--danger" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              type="text"
              value={form.title}
              onChange={set("title")}
              required
              placeholder="Event title"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input form-textarea"
              value={form.description}
              onChange={set("description")}
              required
              placeholder="Describe your event..."
            />
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
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
              placeholder="Venue or city"
            />
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
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
                placeholder="0 for free"
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
            <label className="form-label">Event Image (optional)</label>
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
              disabled={loading}
            >
              {loading ? <Spinner size="sm" /> : "Create Event"}
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
      </div>
    </div>
  );
}
