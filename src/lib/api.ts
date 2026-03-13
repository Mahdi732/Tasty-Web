import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from '../store/authStore';

const GatewayURL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://localhost';

export const api = axios.create({
  baseURL: GatewayURL,
  timeout: 10000,
});

// Request interceptor: Inject Tracing ID & Auth Token
api.interceptors.request.use(
  (config) => {
    config.headers['x-request-id'] = uuidv4();

    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Global Error Handling (Circuit Breakers)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 503) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('global-error', {
            detail: { message: 'Service Unavailable. System Maintenance.' },
          })
        );
      }
    }
    return Promise.reject(error);
  }
);
