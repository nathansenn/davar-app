/**
 * Sync Service
 * Handles offline-first sync of user data (highlights, notes, bookmarks, reading progress)
 * Uses expo-sqlite for local queue and syncs to backend when online
 */

import * as SQLite from 'expo-sqlite';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useUserDataStore } from '../stores/userDataStore';
import type { Highlight, Note, Bookmark } from '../types/ui';

// Types
type SyncAction = 'create' | 'update' | 'delete';
type SyncEntityType = 'highlight' | 'note' | 'bookmark' | 'reading_log';

interface SyncQueueItem {
  id: number;
  entityType: SyncEntityType;
  entityId: string;
  action: SyncAction;
  payload: string; // JSON stringified data
  createdAt: number;
  retryCount: number;
}

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: number | null;
  pendingCount: number;
  error: string | null;
}

// Backend API URL - will be configured via environment
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://davar-api.railway.app';

// Singleton database instance
let db: SQLite.SQLiteDatabase | null = null;

// Sync state
let syncStatus: SyncStatus = {
  isOnline: true,
  isSyncing: false,
  lastSyncAt: null,
  pendingCount: 0,
  error: null,
};

// Listeners for sync status changes
const statusListeners: Set<(status: SyncStatus) => void> = new Set();

/**
 * Initialize the sync database
 */
async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('davar_sync.db');
  
  // Create sync queue table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      retry_count INTEGER DEFAULT 0
    );
    
    CREATE INDEX IF NOT EXISTS idx_sync_queue_created 
    ON sync_queue(created_at);
    
    CREATE TABLE IF NOT EXISTS sync_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  
  return db;
}

/**
 * Add item to sync queue
 */
async function queueSync(
  entityType: SyncEntityType,
  entityId: string,
  action: SyncAction,
  payload: object
): Promise<void> {
  const database = await initDatabase();
  
  // Check for existing pending action on same entity
  const existing = await database.getFirstAsync<{ id: number }>(
    'SELECT id FROM sync_queue WHERE entity_type = ? AND entity_id = ?',
    [entityType, entityId]
  );
  
  if (existing) {
    // Update existing entry instead of creating duplicate
    if (action === 'delete') {
      // If deleting, just update to delete action
      await database.runAsync(
        'UPDATE sync_queue SET action = ?, payload = ?, created_at = ? WHERE id = ?',
        [action, JSON.stringify(payload), Date.now(), existing.id]
      );
    } else {
      // For create/update, update the payload
      await database.runAsync(
        'UPDATE sync_queue SET payload = ?, created_at = ? WHERE id = ?',
        [JSON.stringify(payload), Date.now(), existing.id]
      );
    }
  } else {
    await database.runAsync(
      `INSERT INTO sync_queue (entity_type, entity_id, action, payload, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [entityType, entityId, action, JSON.stringify(payload), Date.now()]
    );
  }
  
  await updatePendingCount();
}

/**
 * Get all pending sync items
 */
async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  const database = await initDatabase();
  
  const rows = await database.getAllAsync<{
    id: number;
    entity_type: string;
    entity_id: string;
    action: string;
    payload: string;
    created_at: number;
    retry_count: number;
  }>('SELECT * FROM sync_queue ORDER BY created_at ASC');
  
  return rows.map(row => ({
    id: row.id,
    entityType: row.entity_type as SyncEntityType,
    entityId: row.entity_id,
    action: row.action as SyncAction,
    payload: row.payload,
    createdAt: row.created_at,
    retryCount: row.retry_count,
  }));
}

/**
 * Remove item from sync queue after successful sync
 */
async function removeSyncItem(id: number): Promise<void> {
  const database = await initDatabase();
  await database.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
  await updatePendingCount();
}

/**
 * Increment retry count for failed sync
 */
async function incrementRetryCount(id: number): Promise<void> {
  const database = await initDatabase();
  await database.runAsync(
    'UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?',
    [id]
  );
}

/**
 * Update pending count in status
 */
async function updatePendingCount(): Promise<void> {
  const database = await initDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM sync_queue'
  );
  syncStatus.pendingCount = result?.count || 0;
  notifyListeners();
}

/**
 * Notify all status listeners
 */
function notifyListeners(): void {
  statusListeners.forEach(listener => listener({ ...syncStatus }));
}

/**
 * Set last sync time
 */
async function setLastSyncTime(timestamp: number): Promise<void> {
  const database = await initDatabase();
  await database.runAsync(
    `INSERT OR REPLACE INTO sync_metadata (key, value) VALUES ('last_sync', ?)`,
    [timestamp.toString()]
  );
  syncStatus.lastSyncAt = timestamp;
  notifyListeners();
}

/**
 * Get last sync time
 */
async function getLastSyncTime(): Promise<number | null> {
  const database = await initDatabase();
  const result = await database.getFirstAsync<{ value: string }>(
    `SELECT value FROM sync_metadata WHERE key = 'last_sync'`
  );
  return result ? parseInt(result.value, 10) : null;
}

/**
 * Sync a single item to the backend
 */
async function syncItem(
  item: SyncQueueItem,
  authToken: string
): Promise<boolean> {
  const endpoint = `${API_BASE_URL}/api/sync/${item.entityType}`;
  const payload = JSON.parse(item.payload);
  
  try {
    let response: Response;
    
    switch (item.action) {
      case 'create':
      case 'update':
        response = await fetch(endpoint, {
          method: item.action === 'create' ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });
        break;
        
      case 'delete':
        response = await fetch(`${endpoint}/${item.entityId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });
        break;
        
      default:
        return false;
    }
    
    if (!response.ok) {
      console.error(`Sync failed for ${item.entityType}/${item.entityId}:`, response.status);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Sync error for ${item.entityType}/${item.entityId}:`, error);
    return false;
  }
}

/**
 * Process sync queue
 */
async function processSyncQueue(authToken: string): Promise<void> {
  if (syncStatus.isSyncing || !syncStatus.isOnline) {
    return;
  }
  
  syncStatus.isSyncing = true;
  syncStatus.error = null;
  notifyListeners();
  
  try {
    const items = await getPendingSyncItems();
    
    for (const item of items) {
      // Skip items with too many retries
      if (item.retryCount >= 5) {
        console.warn(`Skipping sync item ${item.id} after 5 retries`);
        continue;
      }
      
      const success = await syncItem(item, authToken);
      
      if (success) {
        await removeSyncItem(item.id);
      } else {
        await incrementRetryCount(item.id);
      }
    }
    
    await setLastSyncTime(Date.now());
  } catch (error) {
    console.error('Sync queue processing error:', error);
    syncStatus.error = error instanceof Error ? error.message : 'Sync failed';
  } finally {
    syncStatus.isSyncing = false;
    notifyListeners();
  }
}

/**
 * Pull latest data from server
 */
async function pullFromServer(authToken: string): Promise<{
  highlights: Highlight[];
  notes: Note[];
  bookmarks: Bookmark[];
}> {
  const lastSync = await getLastSyncTime();
  const since = lastSync ? `?since=${lastSync}` : '';
  
  const response = await fetch(`${API_BASE_URL}/api/sync/pull${since}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to pull from server');
  }
  
  return response.json();
}

/**
 * Full sync: push pending, then pull updates
 */
async function fullSync(authToken: string): Promise<void> {
  // First push all pending changes
  await processSyncQueue(authToken);
  
  // Then pull updates from server
  try {
    const updates = await pullFromServer(authToken);
    
    // Merge with local store
    const store = useUserDataStore.getState();
    
    // Import server data (will merge, not replace)
    store.importData({
      highlights: updates.highlights,
      notes: updates.notes,
      bookmarks: updates.bookmarks,
    });
    
  } catch (error) {
    console.error('Pull sync error:', error);
    syncStatus.error = 'Failed to pull updates from server';
    notifyListeners();
  }
}

// ===========================================
// PUBLIC API
// ===========================================

export const syncService = {
  /**
   * Initialize sync service
   */
  async init(): Promise<void> {
    await initDatabase();
    syncStatus.lastSyncAt = await getLastSyncTime();
    await updatePendingCount();
    
    // Set up network state listener
    NetInfo.addEventListener((state: NetInfoState) => {
      syncStatus.isOnline = state.isConnected ?? false;
      notifyListeners();
    });
  },
  
  /**
   * Queue a highlight change for sync
   */
  queueHighlightSync(
    highlight: Highlight,
    action: SyncAction
  ): Promise<void> {
    return queueSync('highlight', highlight.id, action, {
      verseRef: highlight.reference,
      color: highlight.color,
      createdAt: highlight.createdAt,
    });
  },
  
  /**
   * Queue a note change for sync
   */
  queueNoteSync(note: Note, action: SyncAction): Promise<void> {
    return queueSync('note', note.id, action, {
      verseRef: note.reference,
      content: note.content,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    });
  },
  
  /**
   * Queue a bookmark change for sync
   */
  queueBookmarkSync(bookmark: Bookmark, action: SyncAction): Promise<void> {
    return queueSync('bookmark', bookmark.id, action, {
      verseRef: bookmark.reference,
      label: bookmark.label,
      createdAt: bookmark.createdAt,
    });
  },
  
  /**
   * Queue reading progress for sync
   */
  queueReadingLogSync(
    date: string,
    passages: string[],
    durationMinutes?: number
  ): Promise<void> {
    const id = `reading_${date}`;
    return queueSync('reading_log', id, 'update', {
      date,
      passages,
      durationMinutes,
    });
  },
  
  /**
   * Trigger sync (if online)
   */
  sync(authToken: string): Promise<void> {
    return processSyncQueue(authToken);
  },
  
  /**
   * Perform full sync (push + pull)
   */
  fullSync,
  
  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return { ...syncStatus };
  },
  
  /**
   * Subscribe to sync status changes
   */
  subscribe(listener: (status: SyncStatus) => void): () => void {
    statusListeners.add(listener);
    // Immediately call with current status
    listener({ ...syncStatus });
    
    return () => {
      statusListeners.delete(listener);
    };
  },
  
  /**
   * Force sync now (even if recently synced)
   */
  async forceSync(authToken: string): Promise<void> {
    await fullSync(authToken);
  },
  
  /**
   * Get pending sync count
   */
  getPendingCount(): number {
    return syncStatus.pendingCount;
  },
  
  /**
   * Clear all pending syncs (use carefully!)
   */
  async clearQueue(): Promise<void> {
    const database = await initDatabase();
    await database.runAsync('DELETE FROM sync_queue');
    await updatePendingCount();
  },
};

export default syncService;
