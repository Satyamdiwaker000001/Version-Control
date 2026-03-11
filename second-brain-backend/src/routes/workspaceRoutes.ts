import { Router } from 'express';
import { workspaceController } from '../controllers/workspaceController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Protect all workspace routes with auth middleware
router.use(authenticateToken); 

router.post('/link', workspaceController.createLinkedWorkspace);
router.get('/', workspaceController.listMyWorkspaces);
router.get('/:workspaceId/collaborators', workspaceController.listCollaborators);

export default router;
