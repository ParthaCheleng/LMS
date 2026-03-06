'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Enrollment {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    progressPercentage: number;
    totalVideos: number;
    completedVideos: number;
}

export default function MyEnrollmentsPage() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        const fetchEnrollments = async () => {
            try {
                const response = await apiClient.get('/enrollments');
                setEnrollments(response.data.enrollments);
            } catch (error) {
                console.error("Failed to fetch enrollments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrollments();
    }, [isAuthenticated, router]);

    if (!isAuthenticated) return null;

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500 border-r-2 border-r-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-surface-900 mb-8">My Enrollments</h1>

            {enrollments.length === 0 ? (
                <div className="card text-center py-16">
                    <h2 className="text-xl font-semibold text-surface-700 mb-4">You haven't enrolled in any courses yet.</h2>
                    <p className="text-surface-500 mb-8">Discover our growing library of courses and start your learning journey today.</p>
                    <Link href="/courses" className="btn-primary">
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {enrollments.map((course) => (
                        <div key={course.id} className="card flex flex-col items-start text-left h-full border-primary-100 hover:border-primary-300 transition-colors">
                            <h3 className="text-xl font-semibold mb-2 text-surface-900">{course.title}</h3>
                            <p className="text-surface-600 mb-6 line-clamp-2 text-sm flex-grow">{course.description}</p>

                            <div className="w-full mb-6">
                                <div className="flex justify-between text-xs text-surface-600 mb-1">
                                    <span>Progress</span>
                                    <span className="font-medium">{course.progressPercentage}%</span>
                                </div>
                                <div className="h-2 w-full bg-surface-100 rounded-full overflow-hidden border border-surface-200">
                                    <div
                                        className="h-full bg-primary-500 transition-all duration-500 ease-out"
                                        style={{ width: `${course.progressPercentage}%` }}
                                    ></div>
                                </div>
                                <div className="mt-1 text-xs text-surface-500 text-right">
                                    {course.completedVideos} / {course.totalVideos} Videos
                                </div>
                            </div>

                            <div className="w-full mt-auto">
                                <Link
                                    href={`/subjects/${course.slug}`}
                                    className="btn w-full bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200"
                                >
                                    {course.progressPercentage > 0 ? 'Continue Course' : 'Start Course'}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
