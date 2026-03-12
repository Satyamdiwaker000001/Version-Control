// Note Service
import { PrismaClient } from "@prisma/client";
import {
  Note,
  NoteVersion,
  CreateNoteInput,
  UpdateNoteInput,
  AppError,
  PaginatedResponse,
} from "../types";

const prisma = new PrismaClient();

export const noteService = {
  // Create new note
  async createNote(
    workspaceId: string,
    userId: string,
    input: CreateNoteInput
  ): Promise<Note> {
    // Verify user is workspace member
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });

    if (!member) {
      throw new AppError(403, "FORBIDDEN", "Access denied");
    }

    const note = await prisma.note.create({
      data: {
        title: input.title,
        content: input.content,
        description: input.description,
        workspaceId,
        userId,
        tags: input.tagIds
          ? {
              create: input.tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        tags: { include: { tag: true } },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // Create initial version
    await prisma.noteVersion.create({
      data: {
        noteId: note.id,
        content: input.content,
        version: 1,
      },
    });

    return this.formatNote(note);
  },

  // Get note by ID
  async getNoteById(noteId: string, userId: string): Promise<Note> {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: {
        workspace: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
        tags: { include: { tag: true } },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!note) {
      throw new AppError(404, "NOTE_NOT_FOUND", "Note not found");
    }

    // Check access: user is workspace member or note is public
    if (!note.isPublic && note.workspace.members.length === 0) {
      throw new AppError(403, "FORBIDDEN", "Access denied");
    }

    return this.formatNote(note);
  },

  // Get all notes in workspace
  async getWorkspaceNotes(
    workspaceId: string,
    userId: string,
    page: number = 1,
    pageSize: number = 20,
    tagId?: string
  ): Promise<PaginatedResponse<Note>> {
    // Verify user is workspace member
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId },
      },
    });

    if (!member) {
      throw new AppError(403, "FORBIDDEN", "Access denied");
    }

    const where: any = { workspaceId };

    if (tagId) {
      where.tags = {
        some: { tagId },
      };
    }

    const total = await prisma.note.count({ where });

    const notes = await prisma.note.findMany({
      where,
      include: {
        tags: { include: { tag: true } },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { updatedAt: "desc" },
    });

    return {
      items: notes.map((note) => this.formatNote(note)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  // Update note
  async updateNote(
    noteId: string,
    userId: string,
    input: UpdateNoteInput
  ): Promise<Note> {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new AppError(404, "NOTE_NOT_FOUND", "Note not found");
    }

    // Verify ownership
    if (note.userId !== userId) {
      throw new AppError(403, "FORBIDDEN", "You can only edit your own notes");
    }

    // If content is changed, create new version
    if (input.content && input.content !== note.content) {
      const lastVersion = await prisma.noteVersion.findFirst({
        where: { noteId },
        orderBy: { version: "desc" },
      });

      const newVersion = (lastVersion?.version || 0) + 1;

      await prisma.noteVersion.create({
        data: {
          noteId,
          content: input.content,
          version: newVersion,
        },
      });
    }

    // Update tags if provided
    if (input.tagIds) {
      await prisma.noteTag.deleteMany({ where: { noteId } });
      if (input.tagIds.length > 0) {
        await prisma.noteTag.createMany({
          data: input.tagIds.map((tagId) => ({
            noteId,
            tagId,
          })),
        });
      }
    }

    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: {
        title: input.title,
        content: input.content,
        description: input.description,
        isPublic: input.isPublic,
        isPinned: input.isPinned,
      },
      include: {
        tags: { include: { tag: true } },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return this.formatNote(updatedNote);
  },

  // Delete note
  async deleteNote(noteId: string, userId: string): Promise<void> {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new AppError(404, "NOTE_NOT_FOUND", "Note not found");
    }

    if (note.userId !== userId) {
      throw new AppError(403, "FORBIDDEN", "You can only delete your own notes");
    }

    await prisma.note.delete({
      where: { id: noteId },
    });
  },

  // Get note versions
  async getNoteVersions(noteId: string, userId: string): Promise<NoteVersion[]> {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new AppError(404, "NOTE_NOT_FOUND", "Note not found");
    }

    // Verify access
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: { userId, workspaceId: note.workspaceId },
      },
    });

    if (!member && !note.isPublic) {
      throw new AppError(403, "FORBIDDEN", "Access denied");
    }

    const versions = await prisma.noteVersion.findMany({
      where: { noteId },
      orderBy: { version: "asc" },
    });

    return versions;
  },

  // Restore note to specific version
  async restoreVersion(
    noteId: string,
    userId: string,
    versionId: string
  ): Promise<Note> {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      throw new AppError(404, "NOTE_NOT_FOUND", "Note not found");
    }

    if (note.userId !== userId) {
      throw new AppError(403, "FORBIDDEN", "You can only restore your own notes");
    }

    const version = await prisma.noteVersion.findUnique({
      where: { id: versionId },
    });

    if (!version || version.noteId !== noteId) {
      throw new AppError(404, "VERSION_NOT_FOUND", "Version not found");
    }

    // Get last version number
    const lastVersion = await prisma.noteVersion.findFirst({
      where: { noteId },
      orderBy: { version: "desc" },
    });

    const newVersionNumber = (lastVersion?.version || 0) + 1;

    // Create new version with old content
    await prisma.noteVersion.create({
      data: {
        noteId,
        content: version.content,
        version: newVersionNumber,
      },
    });

    // Update note content
    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: { content: version.content },
      include: {
        tags: { include: { tag: true } },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return this.formatNote(updatedNote);
  },

  // Helper function
  private formatNote(note: any): Note {
    return {
      id: note.id,
      workspaceId: note.workspaceId,
      userId: note.userId,
      title: note.title,
      content: note.content,
      description: note.description,
      isPublic: note.isPublic,
      isPinned: note.isPinned,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      author: note.author,
      tags: note.tags?.map((nt: any) => nt.tag),
    };
  },
};
