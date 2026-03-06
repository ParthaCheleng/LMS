import prisma from '../config/db';

interface VideoInSequence {
    id: bigint;
    title: string;
    sectionId: bigint;
    orderIndex: number;
    sectionOrderIndex: number;
}

interface VideoNavigation {
    previousVideoId: string | null;
    nextVideoId: string | null;
    prerequisiteVideoId: string | null;
}

interface LockStatus {
    locked: boolean;
    unlockReason: string | null;
}

/**
 * Get the globally ordered list of all videos within a subject.
 * Ordering: section.order_index ASC → video.order_index ASC
 */
export async function getGlobalVideoSequence(subjectId: bigint): Promise<VideoInSequence[]> {
    const sections = await prisma.section.findMany({
        where: { subjectId },
        orderBy: { orderIndex: 'asc' },
        include: {
            videos: {
                orderBy: { orderIndex: 'asc' },
            },
        },
    });

    const sequence: VideoInSequence[] = [];

    for (const section of sections) {
        for (const video of section.videos) {
            sequence.push({
                id: video.id,
                title: video.title,
                sectionId: section.id,
                orderIndex: video.orderIndex,
                sectionOrderIndex: section.orderIndex,
            });
        }
    }

    return sequence;
}

/**
 * Get navigation info (prev/next/prerequisite) for a specific video in a subject.
 */
export async function getVideoNavigation(
    subjectId: bigint,
    videoId: bigint
): Promise<VideoNavigation> {
    const sequence = await getGlobalVideoSequence(subjectId);
    const currentIndex = sequence.findIndex((v) => v.id === videoId);

    if (currentIndex === -1) {
        return {
            previousVideoId: null,
            nextVideoId: null,
            prerequisiteVideoId: null,
        };
    }

    const prev = currentIndex > 0 ? sequence[currentIndex - 1] : null;
    const next = currentIndex < sequence.length - 1 ? sequence[currentIndex + 1] : null;

    return {
        previousVideoId: prev ? prev.id.toString() : null,
        nextVideoId: next ? next.id.toString() : null,
        prerequisiteVideoId: prev ? prev.id.toString() : null, // prerequisite = previous video in global order
    };
}

/**
 * Check if a video is locked for a user.
 * A video is locked if:
 *   - It has a prerequisite video (the previous video in global order)
 *   - AND the user has NOT completed that prerequisite video
 *
 * The first video in a subject is never locked.
 */
export async function isVideoLocked(
    userId: bigint,
    subjectId: bigint,
    videoId: bigint
): Promise<LockStatus> {
    const navigation = await getVideoNavigation(subjectId, videoId);

    // No prerequisite → first video → unlocked
    if (!navigation.prerequisiteVideoId) {
        return { locked: false, unlockReason: null };
    }

    const prerequisiteId = BigInt(navigation.prerequisiteVideoId);

    // Check if user has completed the prerequisite video
    const progress = await prisma.videoProgress.findUnique({
        where: {
            userId_videoId: {
                userId,
                videoId: prerequisiteId,
            },
        },
    });

    if (progress && progress.isCompleted) {
        return { locked: false, unlockReason: null };
    }

    // Find the prerequisite video title for the unlock reason
    const prerequisiteVideo = await prisma.video.findUnique({
        where: { id: prerequisiteId },
        select: { title: true },
    });

    return {
        locked: true,
        unlockReason: `Complete "${prerequisiteVideo?.title || 'previous video'}" to unlock this video`,
    };
}
