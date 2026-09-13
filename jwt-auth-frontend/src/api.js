import axios from "axios";

const API_URL = "http://localhost:3000";

export const login = (userId, password) =>
  axios.post(`${API_URL}/login`, { userId, password });

export const getPrivateData = (accessToken) =>
  axios.get(`${API_URL}/private`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const refreshAccessToken = (refreshToken) =>
  axios.post(`${API_URL}/refresh`, { refreshToken });

export const logout = (refreshToken) =>
  axios.post(`${API_URL}/logout`, { refreshToken });
