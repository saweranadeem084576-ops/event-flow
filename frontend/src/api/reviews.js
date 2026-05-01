import api from "./axios";

export const getEventReviews = (eventId) =>
  api.get(`/events/${eventId}/reviews`);
export const createReview = (eventId, data) =>
  api.post(`/events/${eventId}/reviews`, data);
export const deleteReview = (eventId, reviewId) =>
  api.delete(`/events/${eventId}/reviews/${reviewId}`);
