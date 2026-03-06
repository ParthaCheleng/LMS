'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/auth';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

export default function HeaderAuth() {
    const { isAuthenticated, logout, user } = useAuthStore();
    const router = useRouter();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function handleLogout() {
        try {
            await logoutUser();
        } catch { }
        logout();
        setDropdownOpen(false);
        router.push('/');
    }

    if (isAuthenticated && user) {
        const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

        return (
            <div className="flex items-center gap-4">
                <Link href="/" className="text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Dashboard</Link>
                <Link href="/courses" className="text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Available Courses</Link>
                <div className="w-px h-5 bg-surface-300 dark:bg-surface-700 mx-2"></div>

                {/* Profile Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors border border-primary-200 dark:border-primary-800"
                    >
                        {initial}
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-lg py-2 z-50 animate-fade-in origin-top-right">
                            <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-800 mb-1">
                                <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-xs text-surface-500 dark:text-surface-400 truncate">{user.email}</p>
                            </div>

                            <Link
                                href="/profile"
                                className="block px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                                onClick={() => setDropdownOpen(false)}
                            >
                                My Profile
                            </Link>
                            <Link
                                href="/my-enrollments"
                                className="block px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                                onClick={() => setDropdownOpen(false)}
                            >
                                My Enrollments
                            </Link>
                            <Link
                                href="/completed-courses"
                                className="block px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                                onClick={() => setDropdownOpen(false)}
                            >
                                Completed Courses
                            </Link>
                            <Link
                                href="/settings"
                                className="block px-4 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
                                onClick={() => setDropdownOpen(false)}
                            >
                                Settings
                            </Link>

                            <div className="border-t border-surface-100 dark:border-surface-800 mt-1 pt-1">
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors font-medium"
                                >
                                    Sign out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn-ghost text-sm">Sign In</Link>
            <Link href="/auth/register" className="btn-primary text-sm shadow-sm">Get Started</Link>
        </div>
    );
}
