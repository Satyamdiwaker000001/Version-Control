import { Router, RequestHandler } from 'express';
import { taxonomyController } from '../controllers/taxonomyController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken as RequestHandler);

// Tag CRUD
router.post('/:workspaceId/tags', taxonomyController.createTag as RequestHandler);
router.get('/:workspaceId/tags', taxonomyController.listTags as RequestHandler);
router.get('/:tagId', taxonomyController.getTag as RequestHandler);
router.patch('/:tagId', taxonomyController.updateTag as RequestHandler);
router.delete('/:tagId', taxonomyController.deleteTag as RequestHandler);

export default router;
