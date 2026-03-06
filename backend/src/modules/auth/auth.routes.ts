import { Router } from 'express';
import { registerHandler, loginHandler, refreshHandler, logoutHandler } from './auth.controller';
import { registerValidation, loginValidation } from './auth.validator';

const router = Router();

router.post('/register', registerValidation, registerHandler);
router.post('/login', loginValidation, loginHandler);
router.post('/refresh', refreshHandler);
router.post('/logout', logoutHandler);

export default router;
