import { Router } from 'express';
import { githubController } from '../controllers/githubController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/url', authenticateToken, githubController.authorize);
router.post('/exchange', authenticateToken, githubController.exchangeToken);

export default router;
