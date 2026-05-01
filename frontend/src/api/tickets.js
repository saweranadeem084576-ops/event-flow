import api from "./axios";

export const getMyTickets = () => api.get("/tickets/my-tickets");
export const getTicket = (id) => api.get(`/tickets/${id}`);
export const getAllTickets = () => api.get("/tickets");
