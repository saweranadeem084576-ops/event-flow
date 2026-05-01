import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true, // send httpOnly JWT cookie automatically
});

export default api;
