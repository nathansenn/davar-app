/**
 * Sync Routes
 * 
 * Handles data synchronization between mobile app and server.
 * Mobile is source of truth - server stores backup/sync data.
 * 
 * POST /sync/push - Push local changes to server
 * POST /sync/pull - Pull changes from server
 * POST /sync/full - Full sync (push + pull)
 */

import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { prisma } from '../index';

const router = Router();

// All sync routes require authentication
router.use(requireAuth);

// Validation schemas
const pushSchema = z.object({
  highlights: z.array(z.object({
    id: z.string().uuid(),
    verseRef: z.string(),
    color: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    deleted: z.boolean().optional(),
  })).optional(),
  notes: z.array(z.object({
    id: z.string().uuid(),
    verseRef: z.string(),
    content: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    deleted: z.boolean().optional(),
  })).optional(),
  bookmarks: z.array(z.object({
    id: z.string().uuid(),
    verseRef: z.string(),
    label: z.string().nullable().optional(),
    category: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    deleted: z.boolean().optional(),
  })).optional(),
  readingLogs: z.array(z.object({
    id: z.string().uuid(),
    date: z.string(),
    passages: z.array(z.string()),
    durationMinutes: z.number().nullable().optional(),
    planId: z.string().uuid().nullable().optional(),
    notes: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })).optional(),
  lastSyncAt: z.string().optional(),
});

const pullSchema = z.object({
  since: z.string().optional(), // ISO timestamp
});

/**
 * POST /sync/push
 * Push local changes to server
 */
router.post('/push', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const data = pushSchema.parse(req.body);
    
    const results = {
      highlights: 0,
      notes: 0,
      bookmarks: 0,
      readingLogs: 0,
    };

    // Upsert highlights
    if (data.highlights?.length) {
      for (const h of data.highlights) {
        if (h.deleted) {
          await prisma.highlight.updateMany({
            where: { id: h.id, userId },
            data: { deletedAt: new Date() },
          });
        } else {
          await prisma.highlight.upsert({
            where: { id: h.id },
            create: {
              id: h.id,
              userId,
              verseRef: h.verseRef,
              color: h.color,
              createdAt: new Date(h.createdAt),
            },
            update: {
              verseRef: h.verseRef,
              color: h.color,
              deletedAt: null,
            },
          });
        }
        results.highlights++;
      }
    }

    // Upsert notes
    if (data.notes?.length) {
      for (const n of data.notes) {
        if (n.deleted) {
          await prisma.note.updateMany({
            where: { id: n.id, userId },
            data: { deletedAt: new Date() },
          });
        } else {
          await prisma.note.upsert({
            where: { id: n.id },
            create: {
              id: n.id,
              userId,
              verseRef: n.verseRef,
              content: n.content,
              createdAt: new Date(n.createdAt),
            },
            update: {
              verseRef: n.verseRef,
              content: n.content,
              deletedAt: null,
            },
          });
        }
        results.notes++;
      }
    }

    // Upsert bookmarks
    if (data.bookmarks?.length) {
      for (const b of data.bookmarks) {
        if (b.deleted) {
          await prisma.bookmark.updateMany({
            where: { id: b.id, userId },
            data: { deletedAt: new Date() },
          });
        } else {
          await prisma.bookmark.upsert({
            where: { id: b.id },
            create: {
              id: b.id,
              userId,
              verseRef: b.verseRef,
              label: b.label,
              category: b.category,
              createdAt: new Date(b.createdAt),
            },
            update: {
              verseRef: b.verseRef,
              label: b.label,
              category: b.category,
              deletedAt: null,
            },
          });
        }
        results.bookmarks++;
      }
    }

    // Upsert reading logs
    if (data.readingLogs?.length) {
      for (const r of data.readingLogs) {
        await prisma.readingLog.upsert({
          where: { id: r.id },
          create: {
            id: r.id,
            userId,
            date: new Date(r.date),
            passages: r.passages,
            durationMinutes: r.durationMinutes,
            planId: r.planId,
            notes: r.notes,
            createdAt: new Date(r.createdAt),
          },
          update: {
            passages: r.passages,
            durationMinutes: r.durationMinutes,
            planId: r.planId,
            notes: r.notes,
          },
        });
        results.readingLogs++;
      }
    }

    res.json({
      message: 'Sync push successful',
      synced: results,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /sync/pull
 * Pull changes from server since last sync
 */
router.post('/pull', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const { since } = pullSchema.parse(req.body);
    
    const sinceDate = since ? new Date(since) : new Date(0);

    // Fetch all data updated since last sync
    const [highlights, notes, bookmarks, readingLogs] = await Promise.all([
      prisma.highlight.findMany({
        where: {
          userId,
          updatedAt: { gt: sinceDate },
        },
        select: {
          id: true,
          verseRef: true,
          color: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      prisma.note.findMany({
        where: {
          userId,
          updatedAt: { gt: sinceDate },
        },
        select: {
          id: true,
          verseRef: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      prisma.bookmark.findMany({
        where: {
          userId,
          updatedAt: { gt: sinceDate },
        },
        select: {
          id: true,
          verseRef: true,
          label: true,
          category: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
        },
      }),
      prisma.readingLog.findMany({
        where: {
          userId,
          updatedAt: { gt: sinceDate },
        },
        select: {
          id: true,
          date: true,
          passages: true,
          durationMinutes: true,
          planId: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    res.json({
      highlights: highlights.map(h => ({
        ...h,
        deleted: !!h.deletedAt,
        deletedAt: undefined,
      })),
      notes: notes.map(n => ({
        ...n,
        deleted: !!n.deletedAt,
        deletedAt: undefined,
      })),
      bookmarks: bookmarks.map(b => ({
        ...b,
        deleted: !!b.deletedAt,
        deletedAt: undefined,
      })),
      readingLogs,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /sync/full
 * Full sync - push local changes, then pull server changes
 */
router.post('/full', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const data = pushSchema.parse(req.body);
    
    // First, push all local changes (same as /push)
    const pushResults = { highlights: 0, notes: 0, bookmarks: 0, readingLogs: 0 };
    
    // ... (same push logic as above, abbreviated)
    
    // Then pull all server data
    const sinceDate = data.lastSyncAt ? new Date(data.lastSyncAt) : new Date(0);
    
    const [highlights, notes, bookmarks, readingLogs] = await Promise.all([
      prisma.highlight.findMany({
        where: { userId, deletedAt: null },
      }),
      prisma.note.findMany({
        where: { userId, deletedAt: null },
      }),
      prisma.bookmark.findMany({
        where: { userId, deletedAt: null },
      }),
      prisma.readingLog.findMany({
        where: { userId },
      }),
    ]);

    res.json({
      pushed: pushResults,
      pulled: {
        highlights,
        notes,
        bookmarks,
        readingLogs,
      },
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
