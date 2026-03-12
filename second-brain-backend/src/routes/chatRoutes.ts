import { Router, RequestHandler } from 'express';
import { chatController } from '../controllers/chatController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken as RequestHandler);

// Channels
router.post('/:workspaceId/channels', chatController.createChannel as RequestHandler);
router.get('/:workspaceId/channels', chatController.listChannels as RequestHandler);
router.delete('/:channelId', chatController.deleteChannel as RequestHandler);

// Messages
router.post('/:workspaceId/channels/:channelId/messages', chatController.sendMessage as RequestHandler);
router.get('/:channelId/messages', chatController.getMessages as RequestHandler);
router.patch('/:messageId', chatController.editMessage as RequestHandler);
router.delete('/:messageId', chatController.deleteMessage as RequestHandler);

// Message Replies
router.get('/:messageId/replies', chatController.getReplies as RequestHandler);

// Reactions
router.post('/:messageId/reactions', chatController.addReaction as RequestHandler);
router.delete('/:messageId/reactions', chatController.removeReaction as RequestHandler);

export default router;
