import prisma from '../../config/db';

export async function findUserById(id: bigint) {
    return prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export async function findUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: { email },
    });
}
