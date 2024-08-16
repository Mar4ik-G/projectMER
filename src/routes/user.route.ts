import { Router } from 'express';
import { getUsers } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';

const router = Router();

// Protect the route with 'protect' middleware
router.get('/', protect, getUsers);

export default router;
