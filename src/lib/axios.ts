import axios, { AxiosResponse, AxiosError } from 'axios';

// Define types for API responses
export interface ApiError {
  error: string;
  message?: string;
}

export interface RedactResponse {
  success: boolean;
  data?: Blob;
  error?: string;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  responseType: 'blob',
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    if (error.response) {
      // Handle blob response errors
      if (error.response.data instanceof Blob) {
        const errorText = await error.response.data.text();
        try {
          const errorJson = JSON.parse(errorText) as ApiError;
          return Promise.reject(new Error(errorJson.error || 'An error occurred'));
        } catch {
          return Promise.reject(new Error('An error occurred while processing the file'));
        }
      }
      // Handle JSON response errors
      const errorData = error.response.data as ApiError;
      return Promise.reject(new Error(errorData.error || 'An error occurred'));
    }
    return Promise.reject(error);
  }
);

export default api; 