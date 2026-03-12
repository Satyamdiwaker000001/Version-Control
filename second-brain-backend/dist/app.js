"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const workspaceRoutes_1 = __importDefault(require("./routes/workspaceRoutes"));
const githubRoutes_1 = __importDefault(require("./routes/githubRoutes"));
const noteRoutes_1 = __importDefault(require("./routes/noteRoutes"));
const taxonomyRoutes_1 = __importDefault(require("./routes/taxonomyRoutes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
// Basic Health Check Route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV || 'development' });
});
// API Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/workspaces', workspaceRoutes_1.default);
app.use('/api/github', githubRoutes_1.default);
app.use('/api/notes', noteRoutes_1.default);
app.use('/api/taxonomy', taxonomyRoutes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});
exports.default = app;
