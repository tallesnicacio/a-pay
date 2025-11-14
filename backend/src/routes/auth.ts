import { Router } from 'express';
import { signup, signin, getProfile, getUserRoles } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/profile', authenticate, getProfile);
router.get('/roles', authenticate, getUserRoles);

export default router;
