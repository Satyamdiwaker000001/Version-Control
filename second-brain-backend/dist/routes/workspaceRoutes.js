"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workspaceController_1 = require("../controllers/workspaceController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Protect all workspace routes with auth middleware
router.use(authMiddleware_1.authenticateToken);
router.post('/link', workspaceController_1.workspaceController.createLinkedWorkspace);
router.get('/', workspaceController_1.workspaceController.listMyWorkspaces);
router.get('/:workspaceId/collaborators', workspaceController_1.workspaceController.listCollaborators);
exports.default = router;
