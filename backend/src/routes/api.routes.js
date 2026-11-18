// The API "menu": which URL runs which controller.
import { Router } from 'express';
import { answer, health, leaderboard, startRun } from '../controllers/game.controller.js';
import { validateAnswer, validateStart } from '../middleware/validate.js';

const router = Router();

router.get('/health', health);
router.post('/start', validateStart, startRun);
router.post('/answer', validateAnswer, answer);
router.get('/leaderboard', leaderboard);

export default router;
