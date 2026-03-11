import { Router, RequestHandler } from 'express';
import { noteController } from '../controllers/noteController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken as RequestHandler);

// The base path expects /api/notes/:workspaceId in mounting, or we define it here:
router.get('/:workspaceId', noteController.listNotes as RequestHandler);
router.get('/:workspaceId/:slug', noteController.getNote as RequestHandler);
router.get('/:workspaceId/:slug/history', noteController.getHistory as RequestHandler);
router.post('/:workspaceId', noteController.saveNote as RequestHandler);

export default router;
