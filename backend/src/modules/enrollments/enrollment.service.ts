import prisma from '../../config/db';
import { ApiError } from '../../middleware/errorHandler';

export async function enrollUser(userId: bigint, subjectId: bigint) {
    const subject = await prisma.subject.findUnique({
        where: { id: subjectId },
    });

    if (!subject) {
        throw new ApiError(404, 'Subject not found');
    }

    const existingEnrollment = await prisma.enrollment.findUnique({
        where: {
            userId_subjectId: { userId, subjectId },
        },
    });

    if (existingEnrollment) {
        throw new ApiError(400, 'User is already enrolled in this course');
    }

    const enrollment = await prisma.enrollment.create({
        data: {
            userId,
            subjectId,
        },
        include: {
            subject: true,
        },
    });

    return enrollment;
}

export async function getUserEnrollments(userId: bigint) {
    const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: {
            subject: {
                include: {
                    sections: {
                        include: {
                            videos: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    // We also need to calculate basic progress stats for the user's enrollments.
    const enrollmentsWithProgress = await Promise.all(
        enrollments.map(async (enrollment) => {
            const subject = enrollment.subject;

            // Total videos in subject
            let totalVideos = 0;
            subject.sections.forEach((s) => {
                totalVideos += s.videos.length;
            });

            // Completed videos for this user in this subject
            const progressEntries = await prisma.videoProgress.findMany({
                where: {
                    userId,
                    video: {
                        section: { subjectId: subject.id },
                    },
                    isCompleted: true,
                },
            });

            const completedVideos = progressEntries.length;
            const progressPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

            return {
                id: subject.id.toString(),
                title: subject.title,
                slug: subject.slug,
                description: subject.description,
                price: subject.price,
                currency: subject.currency,
                enrolledAt: enrollment.createdAt,
                progressPercentage,
                totalVideos,
                completedVideos,
            };
        })
    );

    return enrollmentsWithProgress;
}
