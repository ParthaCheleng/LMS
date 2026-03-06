import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './config';

// We'll import the store lazily to avoid circular deps
let getAuthState: (() => { accessToken: string | null; logout: () => void }) | null = null;

export function setAuthStateGetter(
    getter: () => { accessToken: string | null; logout: () => void }
) {
    getAuthState = getter;
}

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // send cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach access token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (getAuthState) {
            const { accessToken } = getAuthState();
            if (accessToken && config.headers) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: on 401 attempt refresh, retry once
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: AxiosError | null, token: string | null = null) {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue this request while refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return apiClient(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const { data } = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }
                );

                const newAccessToken = data.accessToken;

                // Update the store - we'll import dynamically
                const { useAuthStore } = await import('@/store/authStore');
                useAuthStore.getState().setAccessToken(newAccessToken);

                if (data.user) {
                    useAuthStore.getState().setUser(data.user);
                }

                processQueue(null, newAccessToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }

                return apiClient(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError as AxiosError);

                // Refresh failed → logout
                if (getAuthState) {
                    getAuthState().logout();
                }

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
