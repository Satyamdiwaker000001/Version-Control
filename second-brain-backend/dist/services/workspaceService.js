"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceService = void 0;
const prisma_1 = require("../lib/prisma");
exports.workspaceService = {
    // Create a new workspace
    async createWorkspace(input) {
        const workspace = await prisma_1.prisma.workspace.create({
            data: {
                userId: input.userId,
                name: input.name,
                description: input.description,
                type: input.type
            }
        });
        // Add creator as admin member
        await prisma_1.prisma.workspaceMember.create({
            data: {
                workspaceId: workspace.id,
                userId: input.userId,
                role: 'admin'
            }
        });
        return workspace;
    },
    // Get all workspaces for a user
    async getWorkspacesByUser(userId) {
        const workspaces = await prisma_1.prisma.workspace.findMany({
            where: {
                OR: [
                    { userId }, // Owned workspaces
                    { members: { some: { userId } } } // Member of workspaces
                ]
            },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, email: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return workspaces.map((ws) => ({
            ...ws,
            memberCount: ws.members.length
        }));
    },
    // Get a single workspace
    async getWorkspaceById(id) {
        return prisma_1.prisma.workspace.findUnique({ where: { id } });
    },
    // Get workspace with full details
    async getWorkspaceWithDetails(id) {
        const workspace = await prisma_1.prisma.workspace.findUnique({
            where: { id },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, email: true } } }
                }
            }
        });
        if (!workspace)
            return null;
        return {
            ...workspace,
            memberCount: workspace.members.length
        };
    },
    // Update workspace
    async updateWorkspace(id, input) {
        return prisma_1.prisma.workspace.update({
            where: { id },
            data: {
                ...(input.name && { name: input.name }),
                ...(input.description !== undefined && { description: input.description }),
                ...(input.githubOwner && { githubOwner: input.githubOwner }),
                ...(input.githubRepo && { githubRepo: input.githubRepo })
            }
        });
    },
    // Delete workspace
    async deleteWorkspace(id) {
        await prisma_1.prisma.workspace.delete({ where: { id } });
    },
    // Verify user access to workspace
    async verifyWorkspaceAccess(workspaceId, userId) {
        const member = await prisma_1.prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: { workspaceId, userId }
            }
        });
        return !!member;
    },
    // Get workspace members
    async getMembers(workspaceId) {
        return prisma_1.prisma.workspaceMember.findMany({
            where: { workspaceId },
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { joinedAt: 'asc' }
        });
    },
    // Add member to workspace
    async addMember(workspaceId, userId, role = 'member') {
        return prisma_1.prisma.workspaceMember.create({
            data: {
                workspaceId,
                userId,
                role
            }
        });
    },
    // Update member role
    async updateMemberRole(workspaceId, userId, role) {
        return prisma_1.prisma.workspaceMember.update({
            where: {
                workspaceId_userId: { workspaceId, userId }
            },
            data: { role }
        });
    },
    // Remove member from workspace
    async removeMember(workspaceId, userId) {
        await prisma_1.prisma.workspaceMember.delete({
            where: {
                workspaceId_userId: { workspaceId, userId }
            }
        });
    }
};
