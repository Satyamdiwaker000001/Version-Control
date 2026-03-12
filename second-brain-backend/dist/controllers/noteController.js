"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noteController = void 0;
const prisma_1 = require("../lib/prisma");
const octokit_1 = require("octokit");
const zod_1 = require("zod");
const generateSlug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const noteSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    content: zod_1.z.string()
});
exports.noteController = {
    // Returns all markdown notes in the `notes/` directory for the active workspace repo
    listNotes: async (req, res) => {
        try {
            const workspaceId = req.params.workspaceId;
            const workspace = await prisma_1.prisma.workspace.findUnique({ where: { id: workspaceId } });
            if (!workspace || !workspace.githubAccessToken || !workspace.githubOwner || !workspace.githubRepo) {
                return res.status(404).json({ error: 'Workspace or GitHub config not found' });
            }
            const octokit = new octokit_1.Octokit({ auth: workspace.githubAccessToken });
            try {
                const { data } = await octokit.rest.repos.getContent({
                    owner: workspace.githubOwner,
                    repo: workspace.githubRepo,
                    path: 'notes'
                });
                if (!Array.isArray(data)) {
                    return res.status(400).json({ error: 'Target path is not a directory' });
                }
                const notes = data.filter(file => file.name.endsWith('.md')).map(file => ({
                    name: file.name,
                    path: file.path,
                    sha: file.sha,
                    download_url: file.download_url
                }));
                res.json({ notes });
            }
            catch (githubErr) {
                if (githubErr.status === 404) {
                    return res.json({ notes: [] }); // Directory doesn't exist yet
                }
                throw githubErr;
            }
        }
        catch (e) {
            res.status(500).json({ error: e.message });
        }
    },
    // Reads a specific markdown file
    getNote: async (req, res) => {
        try {
            const { workspaceId, slug } = req.params;
            const workspace = await prisma_1.prisma.workspace.findUnique({ where: { id: workspaceId } });
            if (!workspace || !workspace.githubAccessToken || !workspace.githubOwner || !workspace.githubRepo) {
                return res.status(404).json({ error: 'Workspace or GitHub config not found' });
            }
            const octokit = new octokit_1.Octokit({ auth: workspace.githubAccessToken });
            const { data } = await octokit.rest.repos.getContent({
                owner: workspace.githubOwner,
                repo: workspace.githubRepo,
                path: `notes/${slug}.md`
            });
            if (Array.isArray(data) || data.type !== 'file') {
                return res.status(400).json({ error: 'Target is not a file' });
            }
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            res.json({
                sha: data.sha,
                content,
                name: data.name
            });
        }
        catch (e) {
            res.status(e.status || 500).json({ error: e.message });
        }
    },
    // Creates or updates a markdown file
    saveNote: async (req, res) => {
        try {
            const { workspaceId } = req.params;
            const { title, content, sha } = req.body; // sha is required for updates
            if (!title)
                return res.status(400).json({ error: 'Title required' });
            const workspace = await prisma_1.prisma.workspace.findUnique({ where: { id: workspaceId } });
            if (!workspace || !workspace.githubAccessToken || !workspace.githubOwner || !workspace.githubRepo) {
                return res.status(404).json({ error: 'Workspace or GitHub config not found' });
            }
            const slug = generateSlug(title);
            const path = `notes/${slug}.md`;
            const octokit = new octokit_1.Octokit({ auth: workspace.githubAccessToken });
            const encodedContent = Buffer.from(content || '').toString('base64');
            const user = req.user;
            const message = sha ? `Update ${title}` : `Create ${title}`;
            const { data } = await octokit.rest.repos.createOrUpdateFileContents({
                owner: workspace.githubOwner,
                repo: workspace.githubRepo,
                path,
                message: `${message}\n\nCo-authored-by: ${user?.email}`,
                content: encodedContent,
                sha: sha || undefined // Provide previous SHA if updating
            });
            res.status(200).json({
                message: 'Note saved successfully to GitHub',
                commit: data.commit.sha,
                contentSha: data.content?.sha
            });
        }
        catch (e) {
            res.status(e.status || 500).json({ error: e.message });
        }
    },
    // Gets commit history for a specific Markdown file
    getHistory: async (req, res) => {
        try {
            const { workspaceId, slug } = req.params;
            const workspace = await prisma_1.prisma.workspace.findUnique({ where: { id: workspaceId } });
            if (!workspace || !workspace.githubAccessToken || !workspace.githubOwner || !workspace.githubRepo) {
                return res.status(404).json({ error: 'Workspace config missing' });
            }
            const octokit = new octokit_1.Octokit({ auth: workspace.githubAccessToken });
            const { data } = await octokit.rest.repos.listCommits({
                owner: workspace.githubOwner,
                repo: workspace.githubRepo,
                path: `notes/${slug}.md`
            });
            const history = data.map((commit) => ({
                sha: commit.sha,
                message: commit.commit.message,
                author: commit.commit.author?.name || 'Unknown',
                date: commit.commit.author?.date,
                url: commit.html_url
            }));
            res.json({ history });
        }
        catch (e) {
            res.status(e.status || 500).json({ error: e.message });
        }
    }
};
