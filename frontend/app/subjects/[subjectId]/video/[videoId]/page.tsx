'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import apiClient from '@/lib/apiClient';
import { updateVideoProgress } from '@/lib/progress';
import { useVideoStore } from '@/store/videoStore';
import { useSidebarStore } from '@/store/sidebarStore';

// Dynamically import YouTube to avoid SSR issues
const YouTube = dynamic(
    () => import('react-youtube').then((mod) => ({ default: mod.default as React.ComponentType<any> })),
    { ssr: false }
) as React.ComponentType<any>;

interface VideoData {
    id: string;
    title: string;
    description: string | null;
    youtubeUrl: string;
    durationSeconds: number | null;
    sectionId: string;
    sectionTitle: string;
    subjectId: string;
    locked: boolean;
    unlockReason: string | null;
    previousVideoId: string | null;
    nextVideoId: string | null;
    isCompleted: boolean;
    lastPositionSeconds: number;
}

function extractYouTubeId(url: string): string {
    if (!url) return '';
    const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
    );
    return match ? match[1] : url;
}

export default function VideoPlayerPage() {
    const params = useParams();
    const router = useRouter();
    const subjectId = params.subjectId as string;
    const videoId = params.videoId as string;

    const [video, setVideo] = useState<VideoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const playerRef = useRef<{ internalPlayer: { getCurrentTime: () => Promise<number>; seekTo: (seconds: number, allowSeekAhead: boolean) => void } } | null>(null);
    const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { setVideo: setVideoStore } = useVideoStore();
    const { markVideoCompleted } = useSidebarStore();

    // Fetch video data
    useEffect(() => {
        async function fetchVideo() {
            setLoading(true);
            setError('');
            try {
                const { data } = await apiClient.get(`/videos/${videoId}`);
                setVideo(data.video);

                if (!data.video.locked) {
                    setVideoStore({
                        currentVideoId: data.video.id,
                        subjectId,
                        nextVideoId: data.video.nextVideoId,
                        prevVideoId: data.video.previousVideoId,
                        duration: data.video.durationSeconds || 0,
                        currentTime: data.video.lastPositionSeconds || 0,
                        isCompleted: data.video.isCompleted,
                    });
                }
            } catch (err: unknown) {
                if (err && typeof err === 'object' && 'response' in err) {
                    const axiosErr = err as { response?: { status?: number } };
                    if (axiosErr.response?.status === 401) {
                        router.push('/auth/login');
                        return;
                    }
                }
                setError('Failed to load video');
            } finally {
                setLoading(false);
            }
        }
        fetchVideo();

        return () => {
            if (progressTimerRef.current) {
                clearInterval(progressTimerRef.current);
            }
        };
    }, [videoId, subjectId, router, setVideoStore]);

    // Debounced progress update
    const sendProgress = useCallback(
        async (position: number, completed: boolean) => {
            try {
                await updateVideoProgress(videoId, Math.floor(position), completed);
            } catch {
                // Silent fail for progress updates
            }
        },
        [videoId]
    );

    // YouTube player event handlers
    const handleReady = (event: { target: { seekTo: (seconds: number, allowSeekAhead: boolean) => void; getCurrentTime: () => Promise<number> } }) => {
        playerRef.current = { internalPlayer: event.target };

        // Seek to last position
        if (video && video.lastPositionSeconds > 0) {
            event.target.seekTo(video.lastPositionSeconds, true);
        }

        // Start progress tracking interval (every 10 seconds)
        progressTimerRef.current = setInterval(async () => {
            if (playerRef.current) {
                const currentTime = await playerRef.current.internalPlayer.getCurrentTime();
                sendProgress(currentTime, false);
            }
        }, 10000);
    };

    const handleEnd = async () => {
        // Clear interval
        if (progressTimerRef.current) {
            clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
        }

        // Mark as completed
        await sendProgress(video?.durationSeconds || 0, true);
        markVideoCompleted(videoId);

        // Navigate to next video
        if (video?.nextVideoId) {
            router.push(`/subjects/${subjectId}/video/${video.nextVideoId}`);
        }
    };

    const handlePause = async () => {
        if (playerRef.current) {
            const currentTime = await playerRef.current.internalPlayer.getCurrentTime();
            sendProgress(currentTime, false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="p-8 animate-pulse">
                <div className="aspect-video bg-surface-800 rounded-xl mb-6" />
                <div className="h-6 bg-surface-800 rounded w-1/2 mb-3" />
                <div className="h-4 bg-surface-800 rounded w-3/4" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button onClick={() => window.location.reload()} className="btn-primary">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Locked state - NO player mounted
    if (video?.locked) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md animate-fade-in">
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-800 mb-6">
                        <svg className="h-8 w-8 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Video Locked</h2>
                    <p className="text-surface-400 mb-6">{video.unlockReason}</p>
                    <button onClick={() => router.back()} className="btn-secondary">
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!video) return null;

    const youtubeId = extractYouTubeId(video.youtubeUrl);

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
            {/* Video Player */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black mb-6">
                {youtubeId ? (
                    <YouTube
                        videoId={youtubeId}
                        className="absolute inset-0 w-full h-full"
                        iframeClassName="w-full h-full"
                        opts={{
                            width: '100%',
                            height: '100%',
                            playerVars: {
                                autoplay: 1,
                                modestbranding: 1,
                                rel: 0,
                            },
                        }}
                        onReady={handleReady}
                        onEnd={handleEnd}
                        onPause={handlePause}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-surface-400">No video URL configured</p>
                    </div>
                )}
            </div>

            {/* Video Info */}
            <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                    <h1 className="text-xl sm:text-2xl font-bold text-white">{video.title}</h1>
                    {video.isCompleted && (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-1 text-xs font-medium text-green-400">
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            Completed
                        </span>
                    )}
                </div>
                {video.description && (
                    <p className="text-surface-400 text-sm leading-relaxed">{video.description}</p>
                )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between border-t border-surface-800 pt-6">
                {video.previousVideoId ? (
                    <button
                        onClick={() => router.push(`/subjects/${subjectId}/video/${video.previousVideoId}`)}
                        className="btn-secondary"
                    >
                        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                        Previous
                    </button>
                ) : (
                    <div />
                )}

                {video.nextVideoId && (
                    <button
                        onClick={() => router.push(`/subjects/${subjectId}/video/${video.nextVideoId}`)}
                        className="btn-primary"
                    >
                        Next Video
                        <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
