'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';
import { getSubjectProgress } from '@/lib/progress';

interface SubjectDetail {
    id: string;
    title: string;
    slug: string;
    description: string;
    isPublished: boolean;
    sectionsCount: number;
    videosCount: number;
    price: number;
    currency: string;
}

interface ProgressData {
    totalVideos: number;
    completedVideos: number;
    progressPercentage: number;
}

export default function SubjectOverviewPage() {
    const params = useParams();
    const router = useRouter();
    const subjectId = params.subjectId as string;
    const { isAuthenticated } = useAuthStore();

    const [subject, setSubject] = useState<SubjectDetail | null>(null);
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const { data } = await apiClient.get(`/subjects/${subjectId}`);
                setSubject(data.subject);

                if (isAuthenticated) {
                    try {
                        const enrollmentsResponse = await apiClient.get('/enrollments');
                        const isUserEnrolled = enrollmentsResponse.data.enrollments.some(
                            (e: any) => e.id === subjectId
                        );
                        setIsEnrolled(isUserEnrolled);

                        if (isUserEnrolled) {
                            const p = await getSubjectProgress(subjectId);
                            setProgress(p);
                        }
                    } catch {
                        // Progress might fail if not enrolled; that's ok
                    }
                }
            } catch {
                console.error('Failed to fetch subject');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [subjectId, isAuthenticated]);

    if (loading) {
        return (
            <div className="p-8 max-w-4xl mx-auto mt-10">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 bg-surface-200 rounded w-1/2" />
                    <div className="h-4 bg-surface-200 rounded w-3/4" />
                    <div className="h-4 bg-surface-200 rounded w-2/3" />
                </div>
            </div>
        );
    }

    if (!subject) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="card text-center p-12 shadow-sm border-surface-200">
                    <h2 className="text-2xl font-bold text-surface-900 mb-4">Course not found</h2>
                    <a href="/" className="btn-primary">Back to Home</a>
                </div>
            </div>
        );
    }

    const hasProgress = progress && progress.totalVideos > 0;
    const isStarted = hasProgress && progress.completedVideos > 0;

    const handleEnroll = async () => {
        try {
            await apiClient.post(`/enrollments/subjects/${subjectId}`);
            setIsEnrolled(true);
            router.refresh();
        } catch (error) {
            console.error("Failed to enroll");
        }
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
            {/* Header */}
            <div className="mb-10 text-center sm:text-left">
                <span className="inline-flex items-center rounded-full bg-primary-50 border border-primary-200 px-3 py-1 text-xs font-bold text-primary-700 mb-6 shadow-sm uppercase tracking-wider">
                    Course Preview
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-surface-900 mb-6">{subject.title}</h1>
                <p className="text-lg text-surface-600 leading-relaxed max-w-3xl font-medium mb-8">{subject.description}</p>

                {subject.price !== undefined && !isEnrolled && (
                    <div className="inline-block bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm rounded-xl px-6 py-4 mb-4 font-bold text-2xl text-surface-900 dark:text-white">
                        {subject.price === 0 ? 'Free' : `${subject.price} ${subject.currency}`}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl text-center py-6 shadow-sm">
                    <p className="text-3xl font-extrabold text-surface-900 dark:text-white">{subject.sectionsCount}</p>
                    <p className="text-sm font-semibold text-surface-500 mt-2 uppercase tracking-wide">Modules</p>
                </div>
                <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl text-center py-6 shadow-sm">
                    <p className="text-3xl font-extrabold text-surface-900 dark:text-white">{subject.videosCount}</p>
                    <p className="text-sm font-semibold text-surface-500 mt-2 uppercase tracking-wide">Lessons</p>
                </div>
                {hasProgress && (
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl text-center py-6 shadow-md border border-primary-400">
                        <p className="text-3xl font-extrabold text-white">{progress.progressPercentage}%</p>
                        <p className="text-sm font-bold text-primary-100 mt-2 uppercase tracking-wide">Complete</p>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            {hasProgress && (
                <div className="mb-12 bg-white dark:bg-surface-900 p-6 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm">
                    <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-surface-700 font-bold uppercase tracking-wider text-xs">Course Progress</span>
                        <span className="text-primary-600 font-bold">
                            {progress.completedVideos} / {progress.totalVideos} videos
                        </span>
                    </div>
                    <div className="h-3 bg-surface-100 rounded-full overflow-hidden border border-surface-200/50">
                        <div
                            className="h-full bg-primary-500 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${progress.progressPercentage}%` }}
                        />
                    </div>
                </div>
            )}

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 items-center border-t border-surface-200 pt-8 mt-4">
                {isAuthenticated ? (
                    isEnrolled ? (
                        <button
                            onClick={async () => {
                                try {
                                    const { data } = await apiClient.get(`/subjects/${subjectId}/first-video`);
                                    if (data.video) {
                                        router.push(`/subjects/${subjectId}/video/${data.video.id}`);
                                    }
                                } catch {
                                    console.error('No videos available');
                                }
                            }}
                            className="btn-primary w-full sm:w-auto px-10 py-4 text-lg font-bold shadow-md hover:-translate-y-0.5"
                        >
                            {isStarted ? 'Continue Learning' : 'Start First Lesson'}
                        </button>
                    ) : (
                        <button
                            onClick={handleEnroll}
                            className="btn-primary w-full sm:w-auto px-10 py-4 text-lg font-bold shadow-md hover:-translate-y-0.5"
                        >
                            {subject.price && subject.price > 0 ? 'Buy & Enroll Now' : 'Enroll for Free'}
                        </button>
                    )
                ) : (
                    <a href="/auth/login" className="btn-secondary w-full sm:w-auto px-10 py-4 text-lg font-bold shadow-sm">
                        Sign in to Enroll
                    </a>
                )}
            </div>
        </div>
    );
}
