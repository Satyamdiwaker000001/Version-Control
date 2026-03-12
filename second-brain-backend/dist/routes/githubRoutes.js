"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const githubController_1 = require("../controllers/githubController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.get('/url', authMiddleware_1.authenticateToken, githubController_1.githubController.authorize);
router.post('/exchange', authMiddleware_1.authenticateToken, githubController_1.githubController.exchangeToken);
exports.default = router;
