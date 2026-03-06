import prisma from '../config/db';
import { ApiError } from '../middleware/errorHandler';

export async function resolveSubjectId(idOrSlug: string): Promise<bigint> {
    const isNumeric = /^\d+$/.test(idOrSlug);
    if (isNumeric) {
        return BigInt(idOrSlug);
    }
    const subject = await prisma.subject.findUnique({
        where: { slug: idOrSlug },
        select: { id: true },
    });
    if (!subject) {
        throw new ApiError(404, 'Subject not found');
    }
    return subject.id;
}
