import api from "./axios";

export const createBooking = (data) => api.post("/bookings", data);
export const getMyBookings = () => api.get("/bookings/my-bookings");
export const getBooking = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`);
export const getAllBookings = () => api.get("/bookings");
export const getBookingsForEvent = (eventId) =>
  api.get(`/bookings/event/${eventId}`);
