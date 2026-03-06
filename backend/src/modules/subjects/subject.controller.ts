import { Request, Response, NextFunction } from 'express';
import * as subjectService from './subject.service';
import { resolveSubjectId } from '../../utils/resolveSubject';

export async function listSubjects(
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const subjects = await subjectService.listSubjects();
        res.json({ subjects });
    } catch (error) {
        next(error);
    }
}

export async function getSubject(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const subjectId = await resolveSubjectId(req.params.subjectId);
        const subject = await subjectService.getSubject(subjectId);
        res.json({ subject });
    } catch (error) {
        next(error);
    }
}

export async function getSubjectTree(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const userId = BigInt(req.userId!);
        const subjectId = await resolveSubjectId(req.params.subjectId);
        const tree = await subjectService.getSubjectTree(userId, subjectId);
        res.json(tree);
    } catch (error) {
        next(error);
    }
}
