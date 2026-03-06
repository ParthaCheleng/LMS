import * as subjectRepo from './subject.repository';
import { isVideoLocked, getVideoNavigation } from '../../utils/ordering';
import prisma from '../../config/db';
import { ApiError } from '../../middleware/errorHandler';

export async function listSubjects() {
    const subjects = await subjectRepo.findAll();
    return subjects.map((s) => ({
        id: s.id.toString(),
        title: s.title,
        slug: s.slug,
        description: s.description,
        isPublished: s.isPublished,
        category: s.category,
        price: s.price,
        currency: s.currency,
        thumbnail: s.thumbnail,
        sectionsCount: s._count.sections,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
    }));
}

export async function getSubject(subjectId: bigint) {
    const subject = await subjectRepo.findById(subjectId);
    if (!subject) {
        throw new ApiError(404, 'Subject not found');
    }

    // Count total videos
    const videoCount = await prisma.video.count({
        where: {
            section: { subjectId },
        },
    });

    return {
        id: subject.id.toString(),
        title: subject.title,
        slug: subject.slug,
        description: subject.description,
        isPublished: subject.isPublished,
        category: subject.category,
        price: subject.price,
        currency: subject.currency,
        sectionsCount: subject._count.sections,
        videosCount: videoCount,
        createdAt: subject.createdAt,
        updatedAt: subject.updatedAt,
    };
}

export async function getSubjectTree(userId: bigint, subjectId: bigint) {
    const subject = await subjectRepo.findByIdWithTree(subjectId);
    if (!subject) {
        throw new ApiError(404, 'Subject not found');
    }

    // Build tree with lock status and navigation for each video
    const sections = await Promise.all(
        subject.sections.map(async (section) => {
            const videos = await Promise.all(
                section.videos.map(async (video) => {
                    const lockStatus = await isVideoLocked(userId, subjectId, video.id);
                    const nav = await getVideoNavigation(subjectId, video.id);

                    // Check progress
                    const progress = await prisma.videoProgress.findUnique({
                        where: {
                            userId_videoId: {
                                userId,
                                videoId: video.id,
                            },
                        },
                    });

                    return {
                        id: video.id.toString(),
                        title: video.title,
                        description: video.description,
                        youtubeUrl: video.youtubeUrl,
                        orderIndex: video.orderIndex,
                        durationSeconds: video.durationSeconds,
                        locked: lockStatus.locked,
                        unlockReason: lockStatus.unlockReason,
                        previousVideoId: nav.previousVideoId,
                        nextVideoId: nav.nextVideoId,
                        isCompleted: progress?.isCompleted || false,
                        lastPositionSeconds: progress?.lastPositionSeconds || 0,
                    };
                })
            );

            return {
                id: section.id.toString(),
                title: section.title,
                orderIndex: section.orderIndex,
                videos,
            };
        })
    );

    return {
        id: subject.id.toString(),
        title: subject.title,
        slug: subject.slug,
        description: subject.description,
        category: subject.category,
        price: subject.price,
        currency: subject.currency,
        sections: sections,
    };
}
