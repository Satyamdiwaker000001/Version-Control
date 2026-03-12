"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxonomyController = void 0;
const prisma_1 = require("../lib/prisma");
const octokit_1 = require("octokit");
exports.taxonomyController = {
    // Reads a JSON config file
    getConfig: async (req, res) => {
        try {
            const { workspaceId, type } = req.params; // type: 'tags' | 'graph'
            const workspace = await prisma_1.prisma.workspace.findUnique({ where: { id: workspaceId } });
            if (!workspace || !workspace.githubAccessToken || !workspace.githubOwner || !workspace.githubRepo) {
                return res.status(404).json({ error: 'Workspace config missing' });
            }
            const octokit = new octokit_1.Octokit({ auth: workspace.githubAccessToken });
            const path = type === 'tags' ? 'tags/tags.json' : 'graph/relations.json';
            try {
                const { data } = await octokit.rest.repos.getContent({
                    owner: workspace.githubOwner,
                    repo: workspace.githubRepo,
                    path
                });
                if (Array.isArray(data) || data.type !== 'file') {
                    return res.status(400).json({ error: 'Configuration is not a valid JSON file' });
                }
                const content = Buffer.from(data.content, 'base64').toString('utf-8');
                res.json({ data: JSON.parse(content), sha: data.sha });
            }
            catch (githubErr) {
                if (githubErr.status === 404) {
                    return res.json({ data: type === 'tags' ? [] : { nodes: [], links: [] }, sha: null });
                }
                throw githubErr;
            }
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    },
    // Updates a JSON config file
    updateConfig: async (req, res) => {
        try {
            const { workspaceId, type } = req.params;
            const { payload, sha } = req.body;
            const workspace = await prisma_1.prisma.workspace.findUnique({ where: { id: workspaceId } });
            if (!workspace || !workspace.githubAccessToken || !workspace.githubOwner || !workspace.githubRepo) {
                return res.status(404).json({ error: 'Workspace config missing' });
            }
            const path = type === 'tags' ? 'tags/tags.json' : 'graph/relations.json';
            const octokit = new octokit_1.Octokit({ auth: workspace.githubAccessToken });
            const encodedContent = Buffer.from(JSON.stringify(payload, null, 2)).toString('base64');
            const user = req.user;
            const { data } = await octokit.rest.repos.createOrUpdateFileContents({
                owner: workspace.githubOwner,
                repo: workspace.githubRepo,
                path,
                message: `Update ${type} taxonomy\n\nCo-authored-by: ${user?.email}`,
                content: encodedContent,
                sha: sha || undefined
            });
            res.status(200).json({
                message: `${type} updated successfully`,
                commit: data.commit.sha,
                contentSha: data.content?.sha
            });
        }
        catch (e) {
            res.status(e.status || 500).json({ error: e.message });
        }
    }
};
