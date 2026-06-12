import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to track if refresh token request is in progress
let isRefreshing = false;
// Queue to hold requests that failed with 401 while refreshing
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip intercepting auth paths to avoid infinite loops
    const isAuthRoute =
      originalRequest &&
      originalRequest.url &&
      (originalRequest.url.includes('/auth/login') ||
        originalRequest.url.includes('/auth/register') ||
        originalRequest.url.includes('/auth/refresh'));

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute
    ) {
      if (isRefreshing) {
        // If a refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call silent refresh token endpoint (using standard axios to avoid base instance interceptors)
        await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });

        // Process queued requests
        processQueue(null);
        isRefreshing = false;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, reject all queued promises and set status to false to prevent memory leaks
        processQueue(refreshError);
        isRefreshing = false;

        // Dispatch custom event to notify AuthContext to log out the user
        window.dispatchEvent(new CustomEvent('auth-logout'));

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
