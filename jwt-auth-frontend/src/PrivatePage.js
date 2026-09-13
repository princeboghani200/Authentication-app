import { useState, useEffect } from "react";
import { getPrivateData, refreshAccessToken, logout } from "./api";

function PrivatePage({ onLogout }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchPrivateData = async () => {
    const accessToken = localStorage.getItem("accessToken");

    try {
      const response = await getPrivateData(accessToken);
      setMessage(response.data.message);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          const refreshResponse = await refreshAccessToken(refreshToken);
          const newAccessToken = refreshResponse.data.accessToken;

          localStorage.setItem("accessToken", newAccessToken);
          const retryResponse = await getPrivateData(newAccessToken);
          setMessage(retryResponse.data.message);
        } catch (refreshErr) {
          setError("Session expired. Please log in again.");
        }
      }
    }
  };

  useEffect(() => {
    fetchPrivateData();
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    await logout(refreshToken);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    onLogout();
  };

  return (
    <div>
      <h2>Private Page</h2>
      {message && <p>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default PrivatePage;
