"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noteService = void 0;
const prisma_1 = require("../lib/prisma");
exports.noteService = {
    // Create a new note
    async createNote(input) {
        const note = await prisma_1.prisma.note.create({
            data: {
                workspaceId: input.workspaceId,
                userId: input.userId,
                title: input.title,
                content: input.content,
                description: input.description,
                isPublic: input.isPublic ?? false,
                ...(input.tagIds && {
                    tags: {
                        connect: input.tagIds.map(id => ({ id }))
                    }
                })
            },
            include: { tags: true }
        });
        // Create initial version
        await prisma_1.prisma.noteVersion.create({
            data: {
                noteId: note.id,
                userId: input.userId,
                content: input.content,
                changeDescription: 'Initial version'
            }
        });
        return note;
    },
    // Get all notes in workspace
    async getNotesByWorkspace(workspaceId) {
        return prisma_1.prisma.note.findMany({
            where: { workspaceId },
            include: { tags: true, author: { select: { id: true, name: true, email: true } } },
            orderBy: { updatedAt: 'desc' }
        });
    },
    // Get a single note
    async getNoteById(noteId) {
        return prisma_1.prisma.note.findUnique({
            where: { id: noteId },
            include: { tags: true, author: { select: { id: true, name: true, email: true } } }
        });
    },
    // Update a note
    async updateNote(noteId, userId, input) {
        // Create version before updating
        const currentNote = await prisma_1.prisma.note.findUnique({ where: { id: noteId } });
        if (currentNote && input.content && input.content !== currentNote.content) {
            await prisma_1.prisma.noteVersion.create({
                data: {
                    noteId,
                    userId,
                    content: input.content,
                    changeDescription: 'Content updated'
                }
            });
        }
        return prisma_1.prisma.note.update({
            where: { id: noteId },
            data: {
                ...(input.title && { title: input.title }),
                ...(input.content && { content: input.content }),
                ...(input.description !== undefined && { description: input.description }),
                ...(input.isPublic !== undefined && { isPublic: input.isPublic }),
                updatedAt: new Date(),
                ...(input.tagIds && {
                    tags: {
                        set: input.tagIds.map(id => ({ id }))
                    }
                })
            },
            include: { tags: true }
        });
    },
    // Delete a note
    async deleteNote(noteId) {
        await prisma_1.prisma.note.delete({ where: { id: noteId } });
    },
    // Get note versions
    async getNoteVersions(noteId) {
        return prisma_1.prisma.noteVersion.findMany({
            where: { noteId },
            include: { author: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
    },
    // Restore a note version
    async restoreVersion(noteId, versionId, userId) {
        const version = await prisma_1.prisma.noteVersion.findUnique({ where: { id: versionId } });
        if (!version)
            throw new Error('Version not found');
        // Create new version from restoration
        await prisma_1.prisma.noteVersion.create({
            data: {
                noteId,
                userId,
                content: version.content,
                changeDescription: `Restored from version ${versionId.slice(0, 8)}`
            }
        });
        // Update note content
        return prisma_1.prisma.note.update({
            where: { id: noteId },
            data: { content: version.content }
        });
    },
    // Search notes
    async searchNotes(workspaceId, query) {
        return prisma_1.prisma.note.findMany({
            where: {
                workspaceId,
                OR: [
                    { title: { contains: query } },
                    { content: { contains: query } },
                    { description: { contains: query } }
                ]
            },
            include: { tags: true },
            orderBy: { updatedAt: 'desc' }
        });
    },
    // Get notes by tag
    async getNotesByTag(workspaceId, tagId) {
        return prisma_1.prisma.note.findMany({
            where: {
                workspaceId,
                tags: { some: { id: tagId } }
            },
            include: { tags: true },
            orderBy: { updatedAt: 'desc' }
        });
    }
};
