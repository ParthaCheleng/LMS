'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useAuthStore();

    useEffect(() => {
        const root = window.document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    return <>{children}</>;
}
