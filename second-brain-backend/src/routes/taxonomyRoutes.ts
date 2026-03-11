import { Router, RequestHandler } from 'express';
import { taxonomyController } from '../controllers/taxonomyController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken as RequestHandler);

// :type is expected to be 'tags' or 'graph'
router.get('/:workspaceId/:type', taxonomyController.getConfig as RequestHandler);
router.post('/:workspaceId/:type', taxonomyController.updateConfig as RequestHandler);

export default router;
