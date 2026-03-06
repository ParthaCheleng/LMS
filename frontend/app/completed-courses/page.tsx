'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';

interface CourseProgress {
    subjectId: string;
    title: string;
    description: string;
    progressPercentage: number;
    totalVideos: number;
    watchedVideos: number;
}

export default function CompletedCoursesPage() {
    const [enrollments, setEnrollments] = useState<CourseProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchEnrollments = async () => {
            try {
                const response = await apiClient.get('/enrollments');
                // Filter only courses that are 100% complete
                const completed = response.data.enrollments.filter((e: CourseProgress) => e.progressPercentage === 100);
                setEnrollments(completed);
            } catch (error) {
                console.error("Failed to fetch enrollments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrollments();
    }, [isAuthenticated]);

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-surface-50 dark:bg-surface-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Completed Courses</h1>
                    <p className="mt-2 text-surface-600 dark:text-surface-400">A collection of your learning achievements.</p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="card animate-pulse">
                                <div className="h-6 w-3/4 rounded bg-surface-200 dark:bg-surface-800 mb-4"></div>
                                <div className="h-4 w-1/2 rounded bg-surface-200 dark:bg-surface-800"></div>
                            </div>
                        ))}
                    </div>
                ) : enrollments.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {enrollments.map((course) => (
                            <div key={course.subjectId} className="card flex flex-col relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                                    <svg className="w-24 h-24 text-success" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>

                                <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2 z-10">{course.title}</h3>
                                <p className="text-surface-600 dark:text-surface-400 text-sm mb-6 line-clamp-2 z-10">{course.description}</p>

                                <div className="mt-auto z-10">
                                    <div className="flex items-center gap-2 mb-4 bg-success/10 border border-success/20 rounded-lg p-3">
                                        <div className="bg-success rounded-full p-1">
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-success uppercase tracking-wider">Completed</p>
                                            <p className="text-xs text-surface-600 dark:text-surface-400">{course.totalVideos} videos watched</p>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/subjects/${course.subjectId}`}
                                        className="btn-secondary w-full"
                                    >
                                        Review Course Materials
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 card border-dashed">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800 mb-4">
                            <svg className="h-8 w-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-surface-900 dark:text-white">No completed courses yet</h3>
                        <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">Keep learning to earn your first completion!</p>
                        <Link href="/" className="mt-6 btn-primary inline-flex">
                            Continue Learning
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
