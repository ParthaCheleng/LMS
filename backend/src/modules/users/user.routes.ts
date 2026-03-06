import { Router } from 'express';
import { updateProfile } from './user.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

// Protect all user routes
router.use(authMiddleware);

router.put('/profile', updateProfile);

export default router;
