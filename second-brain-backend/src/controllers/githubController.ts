import { Request, Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middlewares/authMiddleware';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'dummy_client_id';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'dummy_client_secret';

export const githubController = {
  // Initiate OAuth flow
  authorize: (req: Request, res: Response) => {
    const redirectUri = `${process.env.FRONTEND_URL}/github/callback`;
    const scope = 'repo,user';
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=${scope}`;
    
    res.json({ url: authUrl });
  },

  // Exchange code for token
  exchangeToken: async (req: AuthRequest, res: Response) => {
    try {
      const { code } = req.body;
      if (!code) return res.status(400).json({ error: 'Code is required' });

      // In a real app we would strictly exchange this back via the backend HTTP post
      const response = await axios.post('https://github.com/login/oauth/access_token', {
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
    } catch (e: any) {
      res.status(500).json({ error: e.message || 'GitHub OAuth failed' });
    }
  }
};
