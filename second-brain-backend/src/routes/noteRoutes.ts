import { Router, RequestHandler } from 'express';
import { noteController } from '../controllers/noteController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken as RequestHandler);

// Notes CRUD
router.post('/:workspaceId', noteController.createNote as RequestHandler);
router.get('/:workspaceId', noteController.listNotes as RequestHandler);
router.get('/:noteId', noteController.getNote as RequestHandler);
router.patch('/:noteId', noteController.updateNote as RequestHandler);
router.delete('/:noteId', noteController.deleteNote as RequestHandler);

// Versions
router.get('/:noteId/versions', noteController.getVersions as RequestHandler);
router.post('/:noteId/versions/:versionId/restore', noteController.restoreVersion as RequestHandler);

export default router;
