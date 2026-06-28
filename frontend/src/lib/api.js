import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem("sf_token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("sf_token");
    delete api.defaults.headers.common["Authorization"];
  }
}

const stored = typeof window !== "undefined" ? localStorage.getItem("sf_token") : null;
if (stored) api.defaults.headers.common["Authorization"] = `Bearer ${stored}`;
