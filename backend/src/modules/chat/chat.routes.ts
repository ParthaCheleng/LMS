import { Router } from 'express';
import { chatWithAI } from './chat.controller';

const router = Router();

router.post('/', chatWithAI);

export default router;
