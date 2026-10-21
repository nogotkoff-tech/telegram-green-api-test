import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

const DEFAULT_TIMEOUT = 15000;

export const createHttpClient = (config?: AxiosRequestConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    timeout: DEFAULT_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ...config,
  });

  // Request interceptor
  instance.interceptors.request.use(
    (reqConfig) => {
      // You can inject auth tokens or logging here
      return reqConfig;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Common error handling logic (e.g. 401, 403, 500)
      return Promise.reject(error);
    }
  );

  return instance;
};

export const httpClient = createHttpClient();
