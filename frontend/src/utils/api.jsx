import axios from "axios";

// ✅ Correct backend URL
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// ✅ Axios instance
const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true, // IMPORTANT for cookies
});

// ✅ Attach token if exists
api.interceptors.request.use(
  (req) => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (user?.token) {
        req.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (error) {
      console.warn("Token parse error:", error);
    }

    return req;
  },
  (error) => Promise.reject(error)
);

// ✅ (NEW) Handle response errors globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized - login again");
      // optional: redirect to login
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;