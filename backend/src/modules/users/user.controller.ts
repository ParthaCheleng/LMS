import { Request, Response } from 'express';
import { updateUserProfile } from './user.service';

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const { name, password } = req.body;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (!name) {
            return res.status(400).json({ success: false, message: 'Name is required' });
        }

        const serializedUserId = BigInt(userId);
        const updatedUser = await updateUserProfile(serializedUserId, name, password);

        // Convert BigInt to string before sending response
        const userResp = {
            ...updatedUser,
            id: updatedUser.id.toString(),
            createdAt: updatedUser.createdAt.toISOString(),
            updatedAt: updatedUser.updatedAt.toISOString(),
        };

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: userResp
        });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while updating profile'
        });
    }
};
