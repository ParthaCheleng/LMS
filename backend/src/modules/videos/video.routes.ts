import { Router } from 'express';
import { getVideo, getFirstVideo } from './video.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

router.get('/:videoId', authMiddleware, getVideo);

export default router;

// Note: The first-video route is mounted separately under /api/subjects
// to keep the URL pattern as GET /api/subjects/:subjectId/first-video
export const firstVideoRouter = Router();
firstVideoRouter.get('/:subjectId/first-video', authMiddleware, getFirstVideo);
