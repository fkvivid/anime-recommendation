import { Router } from 'express';
import { getRecommendations, getAnimeDetails, getAnimes, randomizeRecommendations } from '../controllers/recommendationController.js';

const router = Router();

router.post('/', getRecommendations);
router.get('/random', randomizeRecommendations);
router.get('/:mal_id', getAnimeDetails);
router.get('/', getAnimes);

export default router;