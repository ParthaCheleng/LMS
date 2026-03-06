import * as progressRepo from './progress.repository';
import prisma from '../../config/db';
import { ApiError } from '../../middleware/errorHandler';

export async function getSubjectProgress(userId: bigint, subjectId: bigint) {
    // Verify subject exists
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
    if (!subject) {
        throw new ApiError(404, 'Subject not found');
    }

    // Get total video count for the subject
    const totalVideos = await prisma.video.count({
        where: {
            section: { subjectId },
        },
    });

    // Get user's progress entries
    const progressEntries = await progressRepo.findByUserAndSubject(userId, subjectId);
    const completedVideos = progressEntries.filter((p) => p.isCompleted).length;

    return {
        subjectId: subjectId.toString(),
        totalVideos,
        completedVideos,
        progressPercentage: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0,
        videos: progressEntries.map((p) => ({
            videoId: p.video.id.toString(),
            videoTitle: p.video.title,
            sectionTitle: p.video.section.title,
            lastPositionSeconds: p.lastPositionSeconds,
            isCompleted: p.isCompleted,
            completedAt: p.completedAt,
        })),
    };
}

export async function getVideoProgress(userId: bigint, videoId: bigint) {
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    const progress = await progressRepo.findByUserAndVideo(userId, videoId);

    return {
        videoId: videoId.toString(),
        lastPositionSeconds: progress?.lastPositionSeconds || 0,
        isCompleted: progress?.isCompleted || false,
        completedAt: progress?.completedAt || null,
    };
}

export async function updateVideoProgress(
    userId: bigint,
    videoId: bigint,
    lastPositionSeconds: number,
    isCompleted: boolean
) {
    const video = await prisma.video.findUnique({ where: { id: videoId } });
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    // Cap last_position_seconds at duration_seconds
    let cappedPosition = lastPositionSeconds;
    if (video.durationSeconds !== null && lastPositionSeconds > video.durationSeconds) {
        cappedPosition = video.durationSeconds;
    }

    const existingProgress = await progressRepo.findByUserAndVideo(userId, videoId);
    let finalIsCompleted = isCompleted;
    if (existingProgress && existingProgress.isCompleted) {
        finalIsCompleted = true; // Never un-complete a video
    }

    const progress = await progressRepo.upsertProgress(
        userId,
        videoId,
        cappedPosition,
        finalIsCompleted
    );

    return {
        videoId: videoId.toString(),
        lastPositionSeconds: progress.lastPositionSeconds,
        isCompleted: progress.isCompleted,
        completedAt: progress.completedAt,
    };
}
