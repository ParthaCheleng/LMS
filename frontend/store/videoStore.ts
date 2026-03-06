import { create } from 'zustand';

interface VideoState {
    currentVideoId: string | null;
    subjectId: string | null;
    currentTime: number;
    duration: number;
    isCompleted: boolean;
    nextVideoId: string | null;
    prevVideoId: string | null;

    setVideo: (data: {
        currentVideoId: string;
        subjectId: string;
        nextVideoId: string | null;
        prevVideoId: string | null;
        duration: number;
        currentTime: number;
        isCompleted: boolean;
    }) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    setCompleted: (completed: boolean) => void;
    reset: () => void;
}

export const useVideoStore = create<VideoState>((set) => ({
    currentVideoId: null,
    subjectId: null,
    currentTime: 0,
    duration: 0,
    isCompleted: false,
    nextVideoId: null,
    prevVideoId: null,

    setVideo: (data) => set(data),

    setCurrentTime: (currentTime) => set({ currentTime }),
    setDuration: (duration) => set({ duration }),
    setCompleted: (isCompleted) => set({ isCompleted }),

    reset: () =>
        set({
            currentVideoId: null,
            subjectId: null,
            currentTime: 0,
            duration: 0,
            isCompleted: false,
            nextVideoId: null,
            prevVideoId: null,
        }),
}));
