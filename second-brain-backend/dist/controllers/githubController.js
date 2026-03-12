"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.githubController = void 0;
const axios_1 = __importDefault(require("axios"));
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'dummy_client_id';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'dummy_client_secret';
exports.githubController = {
    // Initiate OAuth flow
    authorize: (req, res) => {
        const redirectUri = `${process.env.FRONTEND_URL}/github/callback`;
        const scope = 'repo,user';
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}`;
        res.json({ url: authUrl });
    },
    // Exchange code for token
    exchangeToken: async (req, res) => {
        try {
            const { code } = req.body;
            if (!code)
                return res.status(400).json({ error: 'Code is required' });
            // In a real app we would strictly exchange this back via the backend HTTP post
            const response = await axios_1.default.post('https://github.com/login/oauth/access_token', {
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code,
            }, {
                headers: { Accept: 'application/json' }
            });
            const accessToken = response.data.access_token;
            if (!accessToken) {
                return res.status(400).json({ error: 'Failed to retrieve access token' });
            }
            // Return token so the frontend can either store it securely instantly, or immediately use it to link workspace
            res.json({ access_token: accessToken });
        }
        catch (e) {
            res.status(500).json({ error: e.message || 'GitHub OAuth failed' });
        }
    }
};
