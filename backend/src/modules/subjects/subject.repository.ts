import prisma from '../../config/db';

export async function findAll() {
    return prisma.subject.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            isPublished: true,
            category: true,
            price: true,
            currency: true,
            thumbnail: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: { sections: true },
            },
        },
    });
}

export async function findById(id: bigint) {
    return prisma.subject.findUnique({
        where: { id },
        include: {
            _count: {
                select: { sections: true },
            },
        },
    });
}

export async function findByIdWithTree(id: bigint) {
    return prisma.subject.findUnique({
        where: { id },
        include: {
            sections: {
                orderBy: { orderIndex: 'asc' },
                include: {
                    videos: {
                        orderBy: { orderIndex: 'asc' },
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            youtubeUrl: true,
                            orderIndex: true,
                            durationSeconds: true,
                            sectionId: true,
                        },
                    },
                },
            },
        },
    });
}
