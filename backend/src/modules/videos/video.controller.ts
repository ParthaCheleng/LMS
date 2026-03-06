import { Request, Response, NextFunction } from 'express';
import * as videoService from './video.service';
import { resolveSubjectId } from '../../utils/resolveSubject';

export async function getVideo(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = BigInt(req.userId!);
        const videoId = BigInt(req.params.videoId);
        const video = await videoService.getVideo(userId, videoId);
        res.json({ video });
    } catch (error) {
        next(error);
    }
}

export async function getFirstVideo(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = BigInt(req.userId!);
        const subjectId = await resolveSubjectId(req.params.subjectId);
        const video = await videoService.getFirstVideo(userId, subjectId);
        res.json({ video });
    } catch (error) {
        next(error);
    }
}
