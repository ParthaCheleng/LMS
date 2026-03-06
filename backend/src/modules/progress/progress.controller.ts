import { Request, Response, NextFunction } from 'express';
import * as progressService from './progress.service';
import { resolveSubjectId } from '../../utils/resolveSubject';

export async function getSubjectProgress(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = BigInt(req.userId!);
        const subjectId = await resolveSubjectId(req.params.subjectId);
        const progress = await progressService.getSubjectProgress(userId, subjectId);
        res.json({ progress });
    } catch (error) {
        next(error);
    }
}

export async function getVideoProgress(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = BigInt(req.userId!);
        const videoId = BigInt(req.params.videoId);
        const progress = await progressService.getVideoProgress(userId, videoId);
        res.json({ progress });
    } catch (error) {
        next(error);
    }
}

export async function updateVideoProgress(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = BigInt(req.userId!);
        const videoId = BigInt(req.params.videoId);
        const { lastPositionSeconds, isCompleted } = req.body;

        if (typeof lastPositionSeconds !== 'number' || lastPositionSeconds < 0) {
            res.status(400).json({ error: 'lastPositionSeconds must be a non-negative number' });
            return;
        }

        const progress = await progressService.updateVideoProgress(
            userId,
            videoId,
            Math.floor(lastPositionSeconds),
            Boolean(isCompleted)
        );
        res.json({ progress });
    } catch (error) {
        next(error);
    }
}
