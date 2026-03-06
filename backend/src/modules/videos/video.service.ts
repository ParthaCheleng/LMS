import * as videoRepo from './video.repository';
import { isVideoLocked, getVideoNavigation } from '../../utils/ordering';
import prisma from '../../config/db';
import { ApiError } from '../../middleware/errorHandler';

export async function getVideo(userId: bigint, videoId: bigint) {
    const video = await videoRepo.findById(videoId);
    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    const subjectId = video.section.subjectId;

    // Check lock status
    const lockStatus = await isVideoLocked(userId, subjectId, videoId);
    if (lockStatus.locked) {
        return {
            id: video.id.toString(),
            title: video.title,
            locked: true,
            unlockReason: lockStatus.unlockReason,
            previousVideoId: null,
            nextVideoId: null,
        };
    }

    // Get navigation
    const nav = await getVideoNavigation(subjectId, videoId);

    // Get progress
    const progress = await prisma.videoProgress.findUnique({
        where: {
            userId_videoId: { userId, videoId },
        },
    });

    return {
        id: video.id.toString(),
        title: video.title,
        description: video.description,
        youtubeUrl: video.youtubeUrl,
        durationSeconds: video.durationSeconds,
        sectionId: video.section.id.toString(),
        sectionTitle: video.section.title,
        subjectId: subjectId.toString(),
        locked: false,
        unlockReason: null,
        previousVideoId: nav.previousVideoId,
        nextVideoId: nav.nextVideoId,
        isCompleted: progress?.isCompleted || false,
        lastPositionSeconds: progress?.lastPositionSeconds || 0,
    };
}

export async function getFirstVideo(userId: bigint, subjectId: bigint) {
    const video = await videoRepo.findFirstVideoBySubjectId(subjectId);
    if (!video) {
        throw new ApiError(404, 'No videos found for this subject');
    }

    return getVideo(userId, video.id);
}
