"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taxonomyController_1 = require("../controllers/taxonomyController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken);
// :type is expected to be 'tags' or 'graph'
router.get('/:workspaceId/:type', taxonomyController_1.taxonomyController.getConfig);
router.post('/:workspaceId/:type', taxonomyController_1.taxonomyController.updateConfig);
exports.default = router;
