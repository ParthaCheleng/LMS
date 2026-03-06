import { Router } from 'express';
import { authMiddleware } from '../../middleware/authMiddleware';
import * as enrollmentController from './enrollment.controller';

const router = Router();

// Get user's enrollments
router.get('/', authMiddleware, enrollmentController.getEnrollments);

// Enroll in a subject
router.post('/subjects/:subjectId', authMiddleware, enrollmentController.enrollInSubject);

export default router;
