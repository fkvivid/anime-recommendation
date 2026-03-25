import { Router } from 'express';
import { signup, signin, refresh, logout } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/refresh', refresh);
router.post('/logout', authenticateToken, logout);

export default router;