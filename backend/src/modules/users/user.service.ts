import prisma from '../../config/db';
import bcrypt from 'bcryptjs';

export const updateUserProfile = async (userId: bigint, name: string, password?: string) => {
    const dataToUpdate: any = { name };

    if (password) {
        dataToUpdate.passwordHash = await bcrypt.hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
        select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true
        }
    });

    return updatedUser;
};
