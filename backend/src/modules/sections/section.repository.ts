import prisma from '../../config/db';

export async function findBySubjectId(subjectId: bigint) {
    return prisma.section.findMany({
        where: { subjectId },
        orderBy: { orderIndex: 'asc' },
        include: {
            videos: {
                orderBy: { orderIndex: 'asc' },
                select: {
                    id: true,
                    title: true,
                    orderIndex: true,
                    durationSeconds: true,
                },
            },
        },
    });
}
