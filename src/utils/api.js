import axios from 'axios';
import { getStore } from '../store/storeAccessor';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const store = getStore();
    if (store) {
      const state = store.getState();
      const token = state.auth?.admin?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const store = getStore();
      if (store) {
        const state = store.getState();
        // Only logout if a user is currently logged in (not during the login attempt itself)
        if (state.auth?.admin) {
          store.dispatch({ type: 'auth/logout' });
          // No navigate() call here — PrivateRoute watches auth.admin and
          // automatically redirects to /login when it becomes null.
          // Using navigate() here was unreliable because the reference may be
          // null during app initialisation (useEffect hasn't run yet).
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
