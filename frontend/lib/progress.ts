import apiClient from './apiClient';

interface SubjectProgress {
    subjectId: string;
    totalVideos: number;
    completedVideos: number;
    progressPercentage: number;
    videos: Array<{
        videoId: string;
        videoTitle: string;
        sectionTitle: string;
        lastPositionSeconds: number;
        isCompleted: boolean;
        completedAt: string | null;
    }>;
}

interface VideoProgress {
    videoId: string;
    lastPositionSeconds: number;
    isCompleted: boolean;
    completedAt: string | null;
}

export async function getSubjectProgress(subjectId: string): Promise<SubjectProgress> {
    const response = await apiClient.get(`/progress/subjects/${subjectId}`);
    return response.data.progress;
}

export async function getVideoProgress(videoId: string): Promise<VideoProgress> {
    const response = await apiClient.get(`/progress/videos/${videoId}`);
    return response.data.progress;
}

export async function updateVideoProgress(
    videoId: string,
    lastPositionSeconds: number,
    isCompleted: boolean
): Promise<VideoProgress> {
    const response = await apiClient.post(`/progress/videos/${videoId}`, {
        lastPositionSeconds,
        isCompleted,
    });
    return response.data.progress;
}
