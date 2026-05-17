import axios, { type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { isDemoMode } from './demo';
import { handleDemoRequest } from '../mocks/handlers';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

if (isDemoMode) {
  api.defaults.adapter = async (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    const result = await handleDemoRequest(config);
    return {
      data: result.data,
      status: result.status,
      statusText: 'OK',
      headers: result.headers,
      config,
    } as AxiosResponse;
  };
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
