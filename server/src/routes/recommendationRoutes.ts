import { Router } from 'express';
import { getRecommendations, getAnimeDetails, getAnimes } from '../controllers/recommendationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.post('/', getRecommendations);
router.get('/:mal_id', getAnimeDetails);
router.get('/', getAnimes);

export default router;