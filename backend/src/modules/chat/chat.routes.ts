import { Router } from 'express';
import { chatWithAI } from './chat.controller';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

router.post('/', authMiddleware, chatWithAI);

export default router;
