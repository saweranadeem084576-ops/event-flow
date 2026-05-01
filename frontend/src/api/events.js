import api from "./axios";

export const getEvents = (params) => api.get("/events", { params });
export const getEvent = (id) => api.get(`/events/${id}`);
export const getMyEvents = () => api.get("/events/my/events");
export const createEvent = (data) =>
  api.post("/events", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateEvent = (id, data) =>
  api.patch(`/events/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteEvent = (id) => api.delete(`/events/${id}`);
export const approveEvent = (id) => api.patch(`/events/${id}/approve`);
export const getEventStats = () => api.get("/events/stats");
