import { Router } from 'express';
import { getUserAnime, addUserAnime, updateUserAnime, deleteUserAnime } from '../controllers/animeController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getUserAnime);
router.post('/', addUserAnime);
router.put('/:id', updateUserAnime);
router.delete('/:id', deleteUserAnime);

export default router;