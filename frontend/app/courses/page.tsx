'use client';

import { useEffect, useState, useMemo } from 'react';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Subject {
    id: string;
    title: string;
    slug: string;
    description: string;
    category?: string;
    sectionsCount: number;
    price?: number;
    currency?: string;
    thumbnail?: string;
    enrollmentStatus?: 'enrolled' | 'not-enrolled';
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

export default function CoursesPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
    const [enrolledSlugs, setEnrolledSlugs] = useState<Set<string>>(new Set());
    const { isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiClient.get('/subjects');
                setSubjects(response.data.data?.subjects || response.data.subjects || []);

                if (isAuthenticated) {
                    try {
                        const enrollRes = await apiClient.get('/enrollments');
                        const enrollments = enrollRes.data.enrollments || [];
                        setEnrolledSlugs(new Set(enrollments.map((e: { slug: string }) => e.slug)));
                    } catch { /* no enrollments */ }
                }
            } catch (error) {
                console.error("Failed to fetch subjects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isAuthenticated]);

    const handleBuy = (subjectId: string) => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        setPurchasedIds(prev => new Set(prev).add(subjectId));
    };

    const handleEnroll = async (subjectId: string) => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        try {
            await apiClient.post(`/enrollments/subjects/${subjectId}`);
            // Refresh data
            const [subjectRes, enrollRes] = await Promise.all([
                apiClient.get('/subjects'),
                apiClient.get('/enrollments')
            ]);
            setSubjects(subjectRes.data.data?.subjects || subjectRes.data.subjects || []);
            const enrollments = enrollRes.data.enrollments || [];
            setEnrolledSlugs(new Set(enrollments.map((e: { slug: string }) => e.slug)));
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

    function getButtonForCourse(subject: Subject) {
        if (enrolledSlugs.has(subject.slug)) {
            return (
                <Link href={`/subjects/${subject.slug}`} className="btn-secondary text-sm">
                    Continue
                </Link>
            );
        }
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
        return (
            <button
                onClick={() => handleBuy(subject.id)}
                className="btn-primary text-sm shadow-sm"
            >
                Get Free
            </button>
        );
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500 border-r-2 border-r-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">Available Courses</h1>
            <p className="text-surface-600 dark:text-surface-400 mb-8">Browse our catalog of premium courses and start learning today.</p>

            <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex gap-2 min-w-max">
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

            {filteredSubjects.length === 0 ? (
                <div className="text-center py-16 card border-dashed">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface-100 dark:bg-surface-800 mb-4">
                        <span className="text-2xl">🔍</span>
                    </div>
                    <h3 className="text-lg font-medium text-surface-900 dark:text-white">No courses found</h3>
                    <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">There are currently no courses listed under {selectedCategory}.</p>
                    <button onClick={() => setSelectedCategory('All Categories')} className="mt-6 btn-secondary inline-flex">
                        View All Categories
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSubjects.map((subject) => (
                        <div key={subject.id} className="card flex flex-col items-start text-left h-full hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300">
                            <div className="h-44 w-full bg-surface-100 dark:bg-surface-950 rounded-lg mb-4 overflow-hidden border border-surface-200 dark:border-surface-800 cursor-pointer" onClick={() => router.push(`/subjects/${subject.slug}`)}>
                                {subject.thumbnail ? (
                                    <img src={subject.thumbnail} alt={subject.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center"><span className="text-4xl">📚</span></div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center rounded-full bg-surface-100 dark:bg-surface-800 px-2.5 py-0.5 text-xs font-medium text-surface-800 dark:text-surface-200">
                                    {subject.category || 'Uncategorized'}
                                </span>
                            </div>

                            <h3 className="text-xl font-semibold mb-2 text-surface-900 dark:text-white cursor-pointer hover:text-primary-600 transition-colors" onClick={() => router.push(`/subjects/${subject.slug}`)}>{subject.title}</h3>
                            <p className="text-surface-600 dark:text-surface-400 mb-4 line-clamp-3 text-sm flex-grow">{subject.description}</p>

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
    );
}
