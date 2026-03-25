import { Router } from 'express';
import { getUserAnime, addUserAnime, updateUserAnime, deleteUserAnime } from '../controllers/animeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getUserAnime);
router.post('/', addUserAnime);
router.put('/:id', updateUserAnime);
router.delete('/:id', deleteUserAnime);

export default router;