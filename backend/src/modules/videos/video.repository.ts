import prisma from '../../config/db';

export async function findById(id: bigint) {
    return prisma.video.findUnique({
        where: { id },
        include: {
            section: {
                select: {
                    id: true,
                    title: true,
                    subjectId: true,
                    orderIndex: true,
                },
            },
        },
    });
}

export async function findBySectionId(sectionId: bigint) {
    return prisma.video.findMany({
        where: { sectionId },
        orderBy: { orderIndex: 'asc' },
    });
}

export async function findFirstVideoBySubjectId(subjectId: bigint) {
    // Get the first section, then the first video in that section
    const firstSection = await prisma.section.findFirst({
        where: { subjectId },
        orderBy: { orderIndex: 'asc' },
    });

    if (!firstSection) return null;

    return prisma.video.findFirst({
        where: { sectionId: firstSection.id },
        orderBy: { orderIndex: 'asc' },
        include: {
            section: {
                select: {
                    id: true,
                    title: true,
                    subjectId: true,
                },
            },
        },
    });
}
