import { prisma } from '../lib/prisma';
import type { Note, NoteVersion } from '@prisma/client';

export interface CreateNoteInput {
  workspaceId: string;
  userId: string;
  title: string;
  content: string;
  description?: string;
  isPublic?: boolean;
  tagIds?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  description?: string;
  isPublic?: boolean;
  tagIds?: string[];
}

export const noteService = {
  // Create a new note
  async createNote(input: CreateNoteInput): Promise<Note> {
    const note = await prisma.note.create({
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
    await prisma.noteVersion.create({
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
  async getNotesByWorkspace(workspaceId: string): Promise<Note[]> {
    return prisma.note.findMany({
      where: { workspaceId },
      include: { tags: true, author: { select: { id: true, name: true, email: true } } },
      orderBy: { updatedAt: 'desc' }
    });
  },

  // Get a single note
  async getNoteById(noteId: string): Promise<Note | null> {
    return prisma.note.findUnique({
      where: { id: noteId },
      include: { tags: true, author: { select: { id: true, name: true, email: true } } }
    });
  },

  // Update a note
  async updateNote(noteId: string, userId: string, input: UpdateNoteInput): Promise<Note> {
    // Create version before updating
    const currentNote = await prisma.note.findUnique({ where: { id: noteId } });
    if (currentNote && input.content && input.content !== currentNote.content) {
      await prisma.noteVersion.create({
        data: {
          noteId,
          userId,
          content: input.content,
          changeDescription: 'Content updated'
        }
      });
    }

    return prisma.note.update({
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
  async deleteNote(noteId: string): Promise<void> {
    await prisma.note.delete({ where: { id: noteId } });
  },

  // Get note versions
  async getNoteVersions(noteId: string): Promise<NoteVersion[]> {
    return prisma.noteVersion.findMany({
      where: { noteId },
      include: { author: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
  },

  // Restore a note version
  async restoreVersion(noteId: string, versionId: string, userId: string): Promise<Note> {
    const version = await prisma.noteVersion.findUnique({ where: { id: versionId } });
    if (!version) throw new Error('Version not found');

    // Create new version from restoration
    await prisma.noteVersion.create({
      data: {
        noteId,
        userId,
        content: version.content,
        changeDescription: `Restored from version ${versionId.slice(0, 8)}`
      }
    });

    // Update note content
    return prisma.note.update({
      where: { id: noteId },
      data: { content: version.content }
    });
  },

  // Search notes
  async searchNotes(workspaceId: string, query: string): Promise<Note[]> {
    return prisma.note.findMany({
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
  async getNotesByTag(workspaceId: string, tagId: string): Promise<Note[]> {
    return prisma.note.findMany({
      where: {
        workspaceId,
        tags: { some: { id: tagId } }
      },
      include: { tags: true },
      orderBy: { updatedAt: 'desc' }
    });
  }
};
