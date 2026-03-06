import prisma from '../../config/db';

export async function findByUserAndVideo(userId: bigint, videoId: bigint) {
    return prisma.videoProgress.findUnique({
        where: {
            userId_videoId: { userId, videoId },
        },
    });
}

export async function findByUserAndSubject(userId: bigint, subjectId: bigint) {
    return prisma.videoProgress.findMany({
        where: {
            userId,
            video: {
                section: { subjectId },
            },
        },
        include: {
            video: {
                select: {
                    id: true,
                    title: true,
                    durationSeconds: true,
                    section: {
                        select: {
                            id: true,
                            title: true,
                            orderIndex: true,
                        },
                    },
                },
            },
        },
    });
}

export async function upsertProgress(
    userId: bigint,
    videoId: bigint,
    lastPositionSeconds: number,
    isCompleted: boolean
) {
    return prisma.videoProgress.upsert({
        where: {
            userId_videoId: { userId, videoId },
        },
        update: {
            lastPositionSeconds,
            isCompleted,
            completedAt: isCompleted ? new Date() : undefined,
        },
        create: {
            userId,
            videoId,
            lastPositionSeconds,
            isCompleted,
            completedAt: isCompleted ? new Date() : null,
        },
    });
}
