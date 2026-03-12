"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceController = void 0;
const prisma_1 = require("../lib/prisma");
const zod_1 = require("zod");
const octokit_1 = require("octokit");
const linkWorkspaceSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    githubOwner: zod_1.z.string().min(1),
    githubRepo: zod_1.z.string().min(1),
    githubAccessToken: zod_1.z.string().min(1),
    type: zod_1.z.enum(['solo', 'team'])
});
exports.workspaceController = {
    createLinkedWorkspace: async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId)
                return res.status(401).json({ error: 'Unauthorized' });
            const body = linkWorkspaceSchema.parse(req.body);
            // Verify if repo is already linked by this user maybe?
            const existing = await prisma_1.prisma.workspace.findFirst({
                where: { userId, githubOwner: body.githubOwner, githubRepo: body.githubRepo }
            });
            if (existing) {
                return res.status(400).json({ error: 'Workspace already linked to this repository.' });
            }
            const workspace = await prisma_1.prisma.workspace.create({
                data: {
                    name: body.name,
                    type: body.type,
                    githubOwner: body.githubOwner,
                    githubRepo: body.githubRepo,
                    githubAccessToken: body.githubAccessToken,
                    userId
                }
            });
            res.status(201).json({ workspace });
        }
        catch (e) {
            res.status(400).json({ error: e.message });
        }
    },
    listMyWorkspaces: async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId)
                return res.status(401).json({ error: 'Unauthorized' });
            const workspaces = await prisma_1.prisma.workspace.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            });
            res.status(200).json({ workspaces });
        }
        catch (e) {
            res.status(500).json({ error: 'Server error' });
        }
    },
    listCollaborators: async (req, res) => {
        try {
            const { workspaceId } = req.params;
            const workspace = await prisma_1.prisma.workspace.findUnique({ where: { id: workspaceId } });
            if (!workspace || !workspace.githubAccessToken || !workspace.githubOwner || !workspace.githubRepo) {
                return res.status(404).json({ error: 'Workspace config missing' });
            }
            const octokit = new octokit_1.Octokit({ auth: workspace.githubAccessToken });
            const { data } = await octokit.rest.repos.listCollaborators({
                owner: workspace.githubOwner,
                repo: workspace.githubRepo
            });
            const members = data.map((user) => ({
                id: user.id.toString(),
                name: user.login,
                avatarUrl: user.avatar_url,
                role: user.permissions?.admin ? 'owner' : (user.permissions?.push ? 'editor' : 'viewer'),
            }));
            res.status(200).json({ members });
        }
        catch (e) {
            res.status(e.status || 500).json({ error: e.message });
        }
    }
};
