import { Router } from 'express';
import { listSubjects, getSubject, getSubjectTree } from './subject.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

// Public routes
router.get('/', listSubjects);
router.get('/:subjectId', getSubject);

// Auth-protected routes
router.get('/:subjectId/tree', authMiddleware, getSubjectTree);

export default router;
