import { create } from 'zustand';
import apiClient from '@/lib/apiClient';

interface VideoNode {
    id: string;
    title: string;
    description: string | null;
    youtubeUrl: string;
    orderIndex: number;
    durationSeconds: number | null;
    locked: boolean;
    unlockReason: string | null;
    previousVideoId: string | null;
    nextVideoId: string | null;
    isCompleted: boolean;
    lastPositionSeconds: number;
}

interface SectionNode {
    id: string;
    title: string;
    orderIndex: number;
    videos: VideoNode[];
}

interface SubjectTree {
    id: string;
    title: string;
    slug: string;
    description: string;
    sections: SectionNode[];
}

interface SidebarState {
    tree: SubjectTree | null;
    loading: boolean;
    error: string | null;

    fetchTree: (subjectId: string) => Promise<void>;
    markVideoCompleted: (videoId: string) => void;
    reset: () => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
    tree: null,
    loading: false,
    error: null,

    fetchTree: async (subjectId: string) => {
        set({ loading: true, error: null });
        try {
            const { data } = await apiClient.get(`/subjects/${subjectId}/tree`);
            set({ tree: data, loading: false });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load course tree';
            set({ error: message, loading: false });
        }
    },

    markVideoCompleted: (videoId: string) => {
        const { tree } = get();
        if (!tree) return;

        const updatedSections = tree.sections.map((section) => ({
            ...section,
            videos: section.videos.map((video) => {
                if (video.id === videoId) {
                    return { ...video, isCompleted: true };
                }
                // Unlock the next video if this one was the prerequisite
                if (video.previousVideoId === videoId && video.locked) {
                    return { ...video, locked: false, unlockReason: null };
                }
                return video;
            }),
        }));

        set({ tree: { ...tree, sections: updatedSections } });
    },

    reset: () => set({ tree: null, loading: false, error: null }),
}));

export type { VideoNode, SectionNode, SubjectTree };
