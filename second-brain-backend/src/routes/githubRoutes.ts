import { Router } from 'express';
import { githubController } from '../controllers/githubController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

// OAuth
router.get('/authorize', githubController.authorize);
router.post('/exchange', githubController.exchangeToken);

// Repository operations
router.use(authenticateToken);

// Link/unlink repositories
router.post('/:workspaceId/repositories', githubController.linkRepository);
router.get('/:workspaceId/repositories', githubController.listRepositories);
router.get('/:repositoryId', githubController.getRepository);
router.delete('/:repositoryId', githubController.unlinkRepository);

// Repository data
router.get('/:owner/:repo/commits', githubController.getCommits);
router.get('/:owner/:repo/branches', githubController.getBranches);

export default router;
