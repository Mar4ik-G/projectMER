import { Router } from 'express';
import {
  register,
  login,
  refresh,
  verifyEmail,
  requestPasswordReset,
  validateResetToken, resetPassword,
} from '../controllers/auth.controller';

const router = Router();

// User registration
router.post('/register', register);

// User login
router.post('/login', login);

// Refresh token
router.post('/refresh', refresh);

// Verify Email
router.get('/verify-email/:token', verifyEmail);

// Request password reset
router.post('/request-password-reset', requestPasswordReset);

// Validate reset token
router.get('/reset-password/:token', validateResetToken);

// Reset password
router.post('/reset-password/:token', resetPassword);

export default router;
