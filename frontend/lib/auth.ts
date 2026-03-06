import apiClient from './apiClient';

interface LoginData {
    email: string;
    password: string;
}

interface RegisterData extends LoginData {
    name: string;
}

interface AuthResponse {
    accessToken: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

export async function registerUser(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
}

export async function loginUser(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
}

export async function logoutUser(): Promise<void> {
    await apiClient.post('/auth/logout');
}

export async function refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh');
    return response.data;
}
