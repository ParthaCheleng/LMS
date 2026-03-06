import { Request, Response, NextFunction } from 'express';
import * as enrollmentService from './enrollment.service';
import { resolveSubjectId } from '../../utils/resolveSubject';

export async function enrollInSubject(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = BigInt(req.userId!);
        const subjectId = await resolveSubjectId(req.params.subjectId);

        const enrollment = await enrollmentService.enrollUser(userId, subjectId);

        res.status(201).json({
            message: 'Successfully enrolled in subject',
            enrollment: {
                subjectId: enrollment.subjectId.toString(),
                createdAt: enrollment.createdAt,
            },
        });
    } catch (error) {
        next(error);
    }
}

export async function getEnrollments(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = BigInt(req.userId!);
        const enrollments = await enrollmentService.getUserEnrollments(userId);

        res.json({
            status: 'success',
            enrollments,
        });
    } catch (error) {
        next(error);
    }
}
