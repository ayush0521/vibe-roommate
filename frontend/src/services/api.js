const BASE_URL = "http://localhost:5000/api";

export const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem("token");

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    // Attach token if present
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // ✅ ALWAYS read as text first (prevents crash)
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("❌ Non-JSON response from server:", text);
      throw new Error("Server returned invalid response (not JSON)");
    }

    // Handle API errors
    if (!res.ok) {
      throw new Error(data.message || "API error");
    }

    return data;

  } catch (err) {
    console.error("🔥 API ERROR:", err.message);
    throw err;
  }
};