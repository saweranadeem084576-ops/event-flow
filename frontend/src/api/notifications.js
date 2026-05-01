import api from "./axios";

export const getMyNotifications = () =>
  api.get("/notifications/my-notifications");
export const markAsRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllAsRead = () => api.patch("/notifications/mark-all-read");
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
