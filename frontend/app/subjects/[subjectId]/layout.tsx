'use client';

import { useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSidebarStore } from '@/store/sidebarStore';
import { useAuthStore } from '@/store/authStore';
import type { VideoNode } from '@/store/sidebarStore';

export default function SubjectLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const pathname = usePathname();
    const subjectId = params.subjectId as string;
    const { tree, loading, error, fetchTree } = useSidebarStore();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (subjectId && isAuthenticated) {
            fetchTree(subjectId);
        }
    }, [subjectId, isAuthenticated, fetchTree]);

    // Extract current videoId from pathname
    const videoMatch = pathname.match(/\/video\/(\d+)/);
    const currentVideoId = videoMatch ? videoMatch[1] : null;

    return (
        <div className="flex min-h-[calc(100vh-64px)]">
            {/* Sidebar */}
            <aside className="hidden lg:flex w-80 flex-col border-r border-surface-800 bg-surface-950 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4">
                    {loading && (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="h-4 bg-surface-800 rounded w-3/4 mb-2" />
                                    <div className="ml-4 space-y-1.5">
                                        <div className="h-3 bg-surface-800 rounded w-5/6" />
                                        <div className="h-3 bg-surface-800 rounded w-4/6" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-8">
                            <p className="text-red-400 text-sm">{error}</p>
                            <button
                                onClick={() => fetchTree(subjectId)}
                                className="btn-ghost mt-2 text-xs"
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    {tree && (
                        <div>
                            <Link
                                href={`/subjects/${subjectId}`}
                                className="block mb-6"
                            >
                                <h2 className="text-sm font-semibold text-white truncate hover:text-primary-400 transition-colors">
                                    {tree.title}
                                </h2>
                            </Link>

                            <div className="space-y-4">
                                {tree.sections.map((section) => (
                                    <div key={section.id}>
                                        <h3 className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2 px-2">
                                            {section.title}
                                        </h3>

                                        <div className="space-y-0.5">
                                            {section.videos.map((video: VideoNode) => {
                                                const isActive = currentVideoId === video.id;
                                                const isLocked = video.locked;
                                                const isCompleted = video.isCompleted;

                                                return (
                                                    <Link
                                                        key={video.id}
                                                        href={
                                                            isLocked
                                                                ? '#'
                                                                : `/subjects/${subjectId}/video/${video.id}`
                                                        }
                                                        className={`
                              flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150
                              ${isActive
                                                                ? 'bg-primary-600/10 text-primary-400 border border-primary-500/20'
                                                                : isLocked
                                                                    ? 'text-surface-600 cursor-not-allowed'
                                                                    : 'text-surface-400 hover:text-white hover:bg-surface-800/50'
                                                            }
                            `}
                                                        onClick={(e) => {
                                                            if (isLocked) e.preventDefault();
                                                        }}
                                                    >
                                                        {/* Status Icon */}
                                                        <span className="flex-shrink-0">
                                                            {isCompleted ? (
                                                                <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            ) : isLocked ? (
                                                                <svg className="h-4 w-4 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                                                </svg>
                                                            ) : isActive ? (
                                                                <svg className="h-4 w-4 text-primary-400" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M8 5v14l11-7z" />
                                                                </svg>
                                                            ) : (
                                                                <div className="h-4 w-4 rounded-full border-2 border-surface-600" />
                                                            )}
                                                        </span>

                                                        <span className="truncate">{video.title}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}
