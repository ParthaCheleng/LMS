'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';

export default function SettingsPage() {
    const { user, setUser, theme, setTheme, isAuthenticated } = useAuthStore();
    const router = useRouter();

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
        } else if (user) {
            setName(user.name);
        }
    }, [isAuthenticated, user, router]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const res = await apiClient.put('/users/profile', { name, password: password || undefined });
            setUser({ ...user!, name: res.data.user.name });
            setMessage({ type: 'success', text: 'Profile updated successfully.' });
            setPassword('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-surface-50 dark:bg-surface-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Account Settings</h1>
                    <p className="mt-2 text-surface-600 dark:text-surface-400">Manage your profile details and app preferences.</p>
                </div>

                <div className="grid gap-8">
                    {/* Appearance Settings */}
                    <div className="card">
                        <h3 className="text-lg font-medium leading-6 text-surface-900 dark:text-white mb-4">Appearance</h3>
                        <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-950 rounded-lg border border-surface-200 dark:border-surface-800">
                            <div>
                                <p className="font-medium text-surface-900 dark:text-white">Theme Preference</p>
                                <p className="text-sm text-surface-500 dark:text-surface-400">Switch between light and dark modes.</p>
                            </div>
                            <div className="flex gap-2 bg-surface-200 dark:bg-surface-800 p-1 rounded-lg">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${theme === 'light' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'}`}
                                >
                                    Light
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-surface-700 text-white shadow-sm' : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'}`}
                                >
                                    Dark
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Profile Settings */}
                    <div className="card">
                        <h3 className="text-lg font-medium leading-6 text-surface-900 dark:text-white mb-4">Edit Profile</h3>

                        {message.text && (
                            <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div>
                                <label className="label" htmlFor="name">Full Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    className="input"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="label" htmlFor="email">Email Address <span className="text-surface-400 text-xs font-normal">(Cannot be changed)</span></label>
                                <input
                                    id="email"
                                    type="text"
                                    className="input bg-surface-100 dark:bg-surface-900 text-surface-500 dark:text-surface-500 cursor-not-allowed"
                                    value={user.email}
                                    readOnly
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="label" htmlFor="password">New Password <span className="text-surface-400 text-xs font-normal">(Leave blank to keep current)</span></label>
                                <input
                                    id="password"
                                    type="password"
                                    className="input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading || !name}
                                    className="btn-primary px-8"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
