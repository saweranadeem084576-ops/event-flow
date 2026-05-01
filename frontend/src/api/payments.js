import api from "./axios";

export const createCheckoutSession = (eventId, numberOfTickets) =>
  api.post("/payments/create-checkout-session", { eventId, numberOfTickets });

export const getMyPayments = () => api.get("/payments/my-payments");
