import { Router } from 'express';
import { register, login, refresh } from '../controllers/auth.controller';

const router = Router();

// User registration
router.post('/register', register);

// User login
router.post('/login', login);

// Refresh token
router.post('/refresh', refresh);

export default router;
