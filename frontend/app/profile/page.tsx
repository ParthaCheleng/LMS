'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
        }
    }, [isAuthenticated, router]);

    if (!user) return null;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-surface-50 dark:bg-surface-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">My Profile</h1>
                        <p className="mt-2 text-surface-600 dark:text-surface-400">View your account credentials and details.</p>
                    </div>
                    <Link href="/settings" className="btn-secondary">
                        Edit Profile
                    </Link>
                </div>

                <div className="card overflow-hidden">
                    <div className="border-b border-surface-200 dark:border-surface-800 px-6 py-5">
                        <h3 className="text-lg font-medium leading-6 text-surface-900 dark:text-white">Personal Information</h3>
                        <p className="mt-1 max-w-2xl text-sm text-surface-500 dark:text-surface-400">Your registration credentials.</p>
                    </div>
                    <div className="px-6 py-5 sm:p-0">
                        <dl className="sm:divide-y sm:divide-surface-200 dark:divide-surface-800">
                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                                <dt className="text-sm font-medium text-surface-500 dark:text-surface-400">Full name</dt>
                                <dd className="mt-1 text-sm text-surface-900 dark:text-white sm:col-span-2 sm:mt-0 font-medium">{user.name}</dd>
                            </div>
                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                                <dt className="text-sm font-medium text-surface-500 dark:text-surface-400">Email address</dt>
                                <dd className="mt-1 text-sm text-surface-900 dark:text-white sm:col-span-2 sm:mt-0 font-medium">{user.email}</dd>
                            </div>
                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5 sm:px-6 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                                <dt className="text-sm font-medium text-surface-500 dark:text-surface-400">Account status</dt>
                                <dd className="mt-1 text-sm sm:col-span-2 sm:mt-0">
                                    <span className="inline-flex items-center rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success dark:bg-success/20">
                                        Active Student
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
