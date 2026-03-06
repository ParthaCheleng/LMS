import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setAuthStateGetter } from '@/lib/apiClient';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    theme: 'light' | 'dark';

    setUser: (user: User) => void;
    setAccessToken: (token: string) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    login: (user: User, accessToken: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            theme: 'light',

            setUser: (user) => set({ user }),
            setAccessToken: (accessToken) => set({ accessToken }),
            setTheme: (theme) => set({ theme }),

            login: (user, accessToken) =>
                set({
                    user,
                    accessToken,
                    isAuthenticated: true,
                }),

            logout: () =>
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                }),
        }),
        {
            name: 'lms-auth',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                isAuthenticated: state.isAuthenticated,
                theme: state.theme,
            }),
        }
    )
);

// Wire up the API client to use the auth store
setAuthStateGetter(() => ({
    accessToken: useAuthStore.getState().accessToken,
    logout: useAuthStore.getState().logout,
}));
