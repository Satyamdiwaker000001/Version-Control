import { Router } from 'express';
import { workspaceController } from '../controllers/workspaceController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// Protect all workspace routes with auth middleware
router.use(authenticateToken);

// Workspace CRUD
router.post('/', workspaceController.createWorkspace);
router.get('/', workspaceController.listWorkspaces);
router.get('/:workspaceId', workspaceController.getWorkspace);
router.patch('/:workspaceId', workspaceController.updateWorkspace);

// Members
router.get('/:workspaceId/members', workspaceController.getMembers);
router.post('/:workspaceId/members', workspaceController.addMember);
router.delete('/:workspaceId/members/:memberId', workspaceController.removeMember);

export default router;
