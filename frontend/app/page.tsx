'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/apiClient';
import Link from 'next/link';

interface Subject {
    id: string;
    title: string;
    slug: string;
    description: string;
    category?: string;
    sectionsCount: number;
    price?: number;
    currency?: string;
    enrollmentStatus?: 'enrolled' | 'not-enrolled';
}

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

const CATEGORIES = [
    'All Categories',
    'Frontend',
    'Backend',
    'Fullstack',
    'Cybersecurity',
    'Blockchain',
    'OOPs',
    'AI',
    'Python',
    'Java',
    'Angular'
];

export default function HomePage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                const { data } = await apiClient.get('/subjects');
                setSubjects(data.data?.subjects || data.subjects || []);

                if (isAuthenticated) {
                    try {
                        const enrollRes = await apiClient.get('/enrollments');
                        setEnrollments(enrollRes.data.enrollments || []);
                    } catch {
                        // User may not have enrollments
                    }
                }
            } catch {
                console.error('Failed to fetch subjects');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [isAuthenticated]);

    // Track which courses are enrolled (by slug)
    const enrolledSlugs = useMemo(() => {
        return new Set(enrollments.map(e => e.slug));
    }, [enrollments]);

    const handleBuy = (subjectId: string) => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        // Simulate purchase — reveal "Enroll Now" button
        setPurchasedIds(prev => new Set(prev).add(subjectId));
    };

    const handleEnroll = async (subjectId: string) => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        try {
            await apiClient.post(`/enrollments/subjects/${subjectId}`);
            // Refresh both lists
            const [subjectRes, enrollRes] = await Promise.all([
                apiClient.get('/subjects'),
                apiClient.get('/enrollments')
            ]);
            setSubjects(subjectRes.data.data?.subjects || subjectRes.data.subjects || []);
            setEnrollments(enrollRes.data.enrollments || []);
            setPurchasedIds(prev => {
                const next = new Set(prev);
                next.delete(subjectId);
                return next;
            });
        } catch (error) {
            console.error("Failed to enroll in subject", error);
        }
    };

    const filteredSubjects = useMemo(() => {
        if (selectedCategory === 'All Categories') return subjects;
        return subjects.filter(subject => subject.category === selectedCategory);
    }, [subjects, selectedCategory]);

    // Available courses = subjects NOT enrolled in
    const availableCourses = useMemo(() => {
        return filteredSubjects.filter(s => !enrolledSlugs.has(s.slug));
    }, [filteredSubjects, enrolledSlugs]);

    function getButtonForCourse(subject: Subject) {
        // Already enrolled
        if (enrolledSlugs.has(subject.slug)) {
            return (
                <Link href={`/subjects/${subject.slug}`} className="btn-secondary text-sm">
                    Continue
                </Link>
            );
        }
        // Already purchased, show Enroll Now
        if (purchasedIds.has(subject.id)) {
            return (
                <button
                    onClick={() => handleEnroll(subject.id)}
                    className="btn-primary text-sm shadow-sm"
                >
                    Enroll Now
                </button>
            );
        }
        // Default: Buy Now (or Enroll Now if free)
        if (subject.price && subject.price > 0) {
            return (
                <button
                    onClick={() => handleBuy(subject.id)}
                    className="btn-primary text-sm shadow-sm"
                >
                    Buy Now
                </button>
            );
        }
        // Free course — still require "Buy" step (shows as "Get Free")
        return (
            <button
                onClick={() => handleBuy(subject.id)}
                className="btn-primary text-sm shadow-sm"
            >
                Get Free
            </button>
        );
    }

    return (
        <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
            {/* Hero Section — only for unauthenticated */}
            {!isAuthenticated && (
                <section className="relative overflow-hidden py-24 sm:py-32 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-50 dark:from-primary-900/20 via-white dark:via-surface-900 to-white dark:to-surface-900"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary-100/50 dark:bg-primary-900/20 blur-[100px] -z-10" />

                    <div className="mx-auto max-w-4xl px-4 text-center z-10 relative animate-fade-in">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 px-3.5 py-1 text-xs font-semibold text-primary-700 dark:text-primary-400 mb-8 shadow-sm">
                            <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
                            Premium Learning Platform
                        </span>

                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-surface-900 dark:text-white mb-6 leading-[1.1]">
                            Master Skills with
                            <br />
                            <span className="text-primary-500">
                                Structured Learning
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-surface-600 dark:text-surface-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                            Progress through expertly curated video courses at your own pace.
                            Track your progress, stay focused, and unlock new content as you learn.
                        </p>

                        <div className="flex items-center justify-center gap-4">
                            <Link href="/auth/register" className="btn-primary px-6 py-3 text-base shadow-sm">
                                Start Learning Free
                            </Link>
                            <Link href="/auth/login" className="btn-secondary px-6 py-3 text-base">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ========== LOGGED IN: Available Courses ========== */}
            {isAuthenticated && (
                <section className="py-16 sm:py-24">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center animate-fade-in">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white mb-4">
                                Available Courses
                            </h2>
                            <p className="text-surface-600 dark:text-surface-400 max-w-2xl mx-auto text-lg">
                                Browse and purchase courses to begin your learning journey.
                            </p>
                        </div>

                        {/* Category Filter */}
                        <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 animate-fade-in">
                            <div className="flex gap-2 min-w-max justify-center">
                                {CATEGORIES.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${selectedCategory === category
                                            ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                                            : 'bg-white dark:bg-surface-900 border-surface-200 dark:border-surface-800 text-surface-700 dark:text-surface-300 hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-400'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="card animate-pulse border-surface-200 dark:border-surface-800">
                                        <div className="h-40 bg-surface-100 dark:bg-surface-800 rounded-lg mb-4" />
                                        <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-3/4 mb-4" />
                                        <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-full mb-2" />
                                    </div>
                                ))}
                            </div>
                        ) : availableCourses.length === 0 ? (
                            <div className="text-center py-16 card border-dashed">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800 mb-4">
                                    <span className="text-2xl">🎉</span>
                                </div>
                                <h3 className="text-lg font-medium text-surface-900 dark:text-white">
                                    {selectedCategory === 'All Categories' ? "You've enrolled in all available courses!" : `No courses found under "${selectedCategory}"`}
                                </h3>
                                {selectedCategory !== 'All Categories' && (
                                    <button onClick={() => setSelectedCategory('All Categories')} className="mt-6 btn-secondary inline-flex">
                                        View All Categories
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                                {availableCourses.map((subject, index) => (
                                    <div
                                        key={subject.id}
                                        className="card flex flex-col items-start text-left h-full hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="h-40 w-full bg-surface-100 dark:bg-surface-950 rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-surface-200 dark:border-surface-800 cursor-pointer" onClick={() => router.push(`/subjects/${subject.slug}`)}>
                                            <span className="text-4xl">📚</span>
                                        </div>

                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="inline-flex items-center rounded-full bg-surface-100 dark:bg-surface-800 px-2.5 py-0.5 text-xs font-medium text-surface-800 dark:text-surface-200">
                                                {subject.category || 'Uncategorized'}
                                            </span>
                                        </div>

                                        <h3
                                            className="text-xl font-bold mb-2 text-surface-900 dark:text-white cursor-pointer hover:text-primary-600 transition-colors"
                                            onClick={() => router.push(`/subjects/${subject.slug}`)}
                                        >
                                            {subject.title}
                                        </h3>
                                        <p className="text-surface-600 dark:text-surface-400 mb-4 line-clamp-3 text-sm flex-grow leading-relaxed">
                                            {subject.description}
                                        </p>

                                        <div className="flex items-center justify-between w-full mt-auto pt-4 border-t border-surface-100 dark:border-surface-800">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-surface-500 dark:text-surface-400">{subject.sectionsCount} Module{subject.sectionsCount !== 1 ? 's' : ''}</span>
                                                {subject.price !== undefined ? (
                                                    <span className="font-bold text-lg text-surface-900 dark:text-white">
                                                        {subject.price === 0 ? 'Free' : `$${subject.price} ${subject.currency}`}
                                                    </span>
                                                ) : null}
                                            </div>

                                            {getButtonForCourse(subject)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ========== LOGGED IN: Your Dashboard (Enrolled Courses Only) ========== */}
            {isAuthenticated && enrollments.length > 0 && (
                <section className="py-16 sm:py-24 border-t border-surface-200 dark:border-surface-800">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="mb-12 text-center animate-fade-in">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-surface-900 dark:text-white mb-4">
                                Your Dashboard
                            </h2>
                            <p className="text-surface-600 dark:text-surface-400 max-w-2xl mx-auto text-lg">
                                Continue your enrolled courses and track your progress.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                            {enrollments.map((course) => (
                                <div key={course.id} className="card flex flex-col items-start text-left h-full border-primary-100 dark:border-primary-900/40 hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300">
                                    <h3 className="text-xl font-bold mb-2 text-surface-900 dark:text-white">{course.title}</h3>
                                    <p className="text-surface-600 dark:text-surface-400 mb-4 line-clamp-2 text-sm flex-grow">{course.description}</p>

                                    <div className="w-full mb-4">
                                        <div className="flex justify-between text-xs text-surface-600 dark:text-surface-400 mb-1">
                                            <span>Progress</span>
                                            <span className="font-medium">{course.progressPercentage}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden border border-surface-200 dark:border-surface-700">
                                            <div
                                                className="h-full bg-primary-500 transition-all duration-500 ease-out"
                                                style={{ width: `${course.progressPercentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="mt-1 text-xs text-surface-500 dark:text-surface-400 text-right">
                                            {course.completedVideos} / {course.totalVideos} Videos
                                        </div>
                                    </div>

                                    <Link
                                        href={`/subjects/${course.slug}`}
                                        className="btn w-full text-center bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 border border-primary-200 dark:border-primary-800 mt-auto"
                                    >
                                        {course.progressPercentage > 0 ? 'Continue Course' : 'Start Course'}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA for unauthenticated users at the bottom */}
            {!isAuthenticated && (
                <section className="py-24 sm:py-32 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-950">
                    <div className="mx-auto max-w-3xl px-4 text-center">
                        <h2 className="text-3xl font-extrabold text-surface-900 dark:text-white mb-6 animate-fade-in">Start your learning journey today</h2>
                        <p className="text-surface-600 dark:text-surface-400 mb-10 text-lg font-medium animate-fade-in">Create a free account to unlock our premium video courses, track your progress, and master new skills.</p>
                        <Link href="/auth/register" className="btn-primary px-8 py-4 text-lg animate-pulse-glow shadow-md">
                            Create Your Free Account
                        </Link>
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 py-8">
                <div className="mx-auto max-w-7xl px-4 text-center">
                    <p className="text-sm font-medium text-surface-500 dark:text-surface-400">
                        &copy; {new Date().getFullYear()} LMS Platform. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
