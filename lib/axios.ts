import axios from 'axios';

// Helper functions for token management
const storeToken = (token: string): void => {
  if (typeof window !== 'undefined') localStorage.setItem('token', token);
};
const storeRefreshToken = (refreshToken: string): void => {
  if (typeof window !== 'undefined') localStorage.setItem('refreshToken', refreshToken);
};
const getAuthToken = (): string | null => {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null;
};
const getRefreshToken = (): string | null => {
  return typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
};
const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user'); // Also remove user from local storage
  }
};
const storeUser = (user: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};
const getUser = (): any | null => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
        return null; // Treat parse error as no user found
      }
    }
    return null;
  }
  return null;
};
// End of helper functions

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api', // Default to /api if not set
});

// Request interceptor to add the JWT token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh on 401 errors
let isRefreshing = false;
let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest); // Retry the original request with the new token
          })
          .catch(err => {
            return Promise.reject(err); // If queue processing fails
          });
      }

      originalRequest._retry = true; // Mark that we've attempted a refresh for this request
      isRefreshing = true;

      const currentRefreshToken = getRefreshToken();
      if (!currentRefreshToken) {
        console.error('No refresh token available, redirecting to login.');
        removeToken(); // Clear tokens
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        isRefreshing = false; // Reset refreshing state
        return Promise.reject(error);
      }

      try {
        // Ensure this endpoint matches your backend refresh token route
        const refreshResponse = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/auth/refresh`, { refreshToken: currentRefreshToken });
        const { token, refreshToken: newRefreshToken, user } = refreshResponse.data;

        storeToken(token);
        if (newRefreshToken) { // Backend might issue a new refresh token
          storeRefreshToken(newRefreshToken);
        }
        if (user) { // Backend might also send updated user info
            storeUser(user);
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${token}`; // Update default for subsequent requests
        originalRequest.headers.Authorization = `Bearer ${token}`; // Update current request's header
        processQueue(null, token); // Process any queued requests with the new token
        return apiClient(originalRequest); // Retry the original request
      } catch (refreshError: any) {
        processQueue(refreshError, null); // Reject queued requests if refresh fails
        console.error('Token refresh error:', refreshError);
        removeToken(); // Clear tokens on refresh failure
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false; // Reset refreshing state in all cases
      }
    }
    return Promise.reject(error); // For errors other than 401 or if _retry is already set
  }
);

export default apiClient;

// Re-export auth utility functions for use in components
export { storeToken, storeRefreshToken, getAuthToken, getRefreshToken, removeToken, storeUser, getUser };
