"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const noteController_1 = require("../controllers/noteController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken);
// The base path expects /api/notes/:workspaceId in mounting, or we define it here:
router.get('/:workspaceId', noteController_1.noteController.listNotes);
router.get('/:workspaceId/:slug', noteController_1.noteController.getNote);
router.get('/:workspaceId/:slug/history', noteController_1.noteController.getHistory);
router.post('/:workspaceId', noteController_1.noteController.saveNote);
exports.default = router;
