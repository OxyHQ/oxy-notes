import * as Network from 'expo-network';
import { OxyServices } from '@oxyhq/services';
import { notesApi, Note, CreateNoteData } from './api';
import { storageManager, StoredNote, PendingSync } from './storage';

class SyncManager {
  private isOnline = true;
  private isSyncing = false;
  private syncListeners: ((status: SyncStatus) => void)[] = [];

  constructor() {
    this.initializeNetworkListener();
  }

  private async initializeNetworkListener() {
    // Check initial network status
    try {
      const networkState = await Network.getNetworkStateAsync();
      this.isOnline = networkState.isConnected ?? false;
    } catch (error) {
      console.error('Error checking network status:', error);
      this.isOnline = false;
    }
    
    // Set up periodic network checks (since expo-network doesn't have a listener)
    setInterval(async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        const wasOnline = this.isOnline;
        this.isOnline = networkState.isConnected ?? false;
        
        // If we just came online and weren't syncing, start sync
        if (this.isOnline && !wasOnline && !this.isSyncing) {
          this.syncNotes();
        }
      } catch (error) {
        console.error('Error checking network status:', error);
        this.isOnline = false;
      }
    }, 5000); // Check every 5 seconds
  }

  // Network Status
  getNetworkStatus(): boolean {
    return this.isOnline;
  }

  // Sync Listeners
  addSyncListener(callback: (status: SyncStatus) => void) {
    this.syncListeners.push(callback);
  }

  removeSyncListener(callback: (status: SyncStatus) => void) {
    this.syncListeners = this.syncListeners.filter(listener => listener !== callback);
  }

  private notifySyncListeners(status: SyncStatus) {
    this.syncListeners.forEach(listener => listener(status));
  }

  // Notes Operations (with offline support)
  async createNote(
    noteData: { title: string; content: string; color?: string },
    oxyServices?: OxyServices,
    activeSessionId?: string
  ): Promise<StoredNote> {
    const localId = storageManager.generateLocalId();
    const now = Date.now();
    const userId = await storageManager.getCurrentUserId() || 'unknown';
    
    const storedNote: StoredNote = {
      id: localId, // Will be replaced with server ID when synced
      localId,
      title: noteData.title,
      content: noteData.content,
      color: noteData.color || '#ffffff',
      archived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId,
      lastModified: now,
      syncStatus: this.isOnline ? 'pending' : 'pending',
    };

    // Save to local storage immediately
    await storageManager.saveNote(storedNote);

    if (this.isOnline && oxyServices && activeSessionId) {
      // Try to sync immediately
      try {
        const result = await notesApi.createNote(noteData, oxyServices, activeSessionId);
        storedNote.id = result.note.id;
        storedNote.syncStatus = 'synced';
        await storageManager.saveNote(storedNote);
        return storedNote;
      } catch (error) {
        console.error('Failed to sync note creation:', error);
        // Add to pending sync queue
        await this.addToPendingSync({
          id: localId,
          action: 'create',
          noteData,
          timestamp: now,
        });
      }
    } else {
      // Add to pending sync queue for later
      await this.addToPendingSync({
        id: localId,
        action: 'create',
        noteData,
        timestamp: now,
      });
    }

    return storedNote;
  }

  async updateNote(
    localId: string,
    noteData: { title: string; content: string; color?: string },
    oxyServices?: OxyServices,
    activeSessionId?: string
  ): Promise<StoredNote> {
    const existingNote = await storageManager.getNoteById(localId);
    if (!existingNote) {
      throw new Error('Note not found');
    }

    const now = Date.now();
    const updatedNote: StoredNote = {
      ...existingNote,
      title: noteData.title,
      content: noteData.content,
      color: noteData.color || existingNote.color,
      updatedAt: new Date().toISOString(),
      lastModified: now,
      syncStatus: 'pending',
    };

    // Save to local storage immediately
    await storageManager.saveNote(updatedNote);

    if (this.isOnline && oxyServices && activeSessionId && existingNote.id && !existingNote.id.startsWith('local_')) {
      // Try to sync immediately if we have a server ID
      try {
        await notesApi.updateNote(existingNote.id, noteData, oxyServices, activeSessionId);
        updatedNote.syncStatus = 'synced';
        await storageManager.saveNote(updatedNote);
        return updatedNote;
      } catch (error) {
        console.error('Failed to sync note update:', error);
        // Add to pending sync queue
        await this.addToPendingSync({
          id: localId,
          action: 'update',
          noteData,
          timestamp: now,
        });
      }
    } else {
      // Add to pending sync queue for later
      await this.addToPendingSync({
        id: localId,
        action: 'update',
        noteData,
        timestamp: now,
      });
    }

    return updatedNote;
  }

  async deleteNote(
    localId: string,
    oxyServices?: OxyServices,
    activeSessionId?: string
  ): Promise<void> {
    const existingNote = await storageManager.getNoteById(localId);
    if (!existingNote) {
      throw new Error('Note not found');
    }

    // Remove from local storage immediately
    await storageManager.deleteNote(localId);

    if (this.isOnline && oxyServices && activeSessionId && existingNote.id && !existingNote.id.startsWith('local_')) {
      // Try to sync deletion immediately if we have a server ID
      try {
        await notesApi.deleteNote(existingNote.id, oxyServices, activeSessionId);
        return;
      } catch (error) {
        console.error('Failed to sync note deletion:', error);
        // Add to pending sync queue
        await this.addToPendingSync({
          id: localId,
          action: 'delete',
          timestamp: Date.now(),
        });
      }
    } else if (existingNote.id && !existingNote.id.startsWith('local_')) {
      // Add to pending sync queue for later if it's a server note
      await this.addToPendingSync({
        id: localId,
        action: 'delete',
        timestamp: Date.now(),
      });
    }
  }

  async archiveNote(
    localId: string,
    oxyServices?: OxyServices,
    activeSessionId?: string
  ): Promise<StoredNote> {
    const existingNote = await storageManager.getNoteById(localId);
    if (!existingNote) {
      throw new Error('Note not found');
    }

    // Update archived status locally immediately
    const updatedNote: StoredNote = {
      ...existingNote,
      archived: true,
      lastModified: Date.now(),
      syncStatus: 'pending',
    };

    await storageManager.saveNote(updatedNote);

    if (this.isOnline && oxyServices && activeSessionId && existingNote.id && !existingNote.id.startsWith('local_')) {
      // Try to sync archive immediately if we have a server ID
      try {
        const result = await notesApi.archiveNote(existingNote.id, oxyServices, activeSessionId);
        updatedNote.syncStatus = 'synced';
        updatedNote.archived = result.note.archived;
        updatedNote.updatedAt = result.note.updatedAt;
        await storageManager.saveNote(updatedNote);
        return updatedNote;
      } catch (error) {
        console.error('Failed to sync note archive:', error);
        // Add to pending sync queue
        await this.addToPendingSync({
          id: localId,
          action: 'archive',
          timestamp: Date.now(),
        });
      }
    } else if (existingNote.id && !existingNote.id.startsWith('local_')) {
      // Add to pending sync queue for later if it's a server note
      await this.addToPendingSync({
        id: localId,
        action: 'archive',
        timestamp: Date.now(),
      });
    }

    return updatedNote;
  }

  async unarchiveNote(
    localId: string,
    oxyServices?: OxyServices,
    activeSessionId?: string
  ): Promise<StoredNote> {
    const existingNote = await storageManager.getNoteById(localId);
    if (!existingNote) {
      throw new Error('Note not found');
    }

    // Update archived status locally immediately
    const updatedNote: StoredNote = {
      ...existingNote,
      archived: false,
      lastModified: Date.now(),
      syncStatus: this.isOnline ? 'pending' : 'pending',
    };

    await storageManager.saveNote(updatedNote);

    if (this.isOnline && oxyServices && activeSessionId && existingNote.id && !existingNote.id.startsWith('local_')) {
      // Try to sync unarchive immediately if we have a server ID
      try {
        const result = await notesApi.unarchiveNote(existingNote.id, oxyServices, activeSessionId);
        updatedNote.syncStatus = 'synced';
        updatedNote.archived = result.note.archived;
        updatedNote.updatedAt = result.note.updatedAt;
        await storageManager.saveNote(updatedNote);
        return updatedNote;
      } catch (error) {
        console.error('Failed to sync note unarchive:', error);
        // Add to pending sync queue
        await this.addToPendingSync({
          id: localId,
          action: 'unarchive',
          timestamp: Date.now(),
        });
      }
    } else if (existingNote.id && !existingNote.id.startsWith('local_')) {
      // Add to pending sync queue for later if it's a server note
      await this.addToPendingSync({
        id: localId,
        action: 'unarchive',
        timestamp: Date.now(),
      });
    }

    return updatedNote;
  }

  async getAllNotes(): Promise<StoredNote[]> {
    return await storageManager.getAllNotes();
  }

  async getNoteById(localId: string): Promise<StoredNote | null> {
    return await storageManager.getNoteById(localId);
  }

  // Sync Operations
  async syncNotes(oxyServices?: OxyServices, activeSessionId?: string): Promise<void> {
    if (!this.isOnline || this.isSyncing) {
      return;
    }

    if (!oxyServices || !activeSessionId) {
      console.log('Cannot sync: missing authentication');
      return;
    }

    this.isSyncing = true;
    this.notifySyncListeners({ status: 'syncing', progress: 0 });

    try {
      // Step 1: Fetch server notes
      const serverNotes = await this.fetchServerNotes(oxyServices, activeSessionId);
      
      // Step 2: Process pending syncs
      await this.processPendingSyncs(oxyServices, activeSessionId);
      
      // Step 3: Merge server notes with local notes
      await this.mergeServerNotes(serverNotes);
      
      // Step 4: Update last sync time
      await storageManager.setLastSyncTime(Date.now());
      
      this.notifySyncListeners({ status: 'completed', progress: 100 });
    } catch (error) {
      console.error('Sync failed:', error);
      this.notifySyncListeners({ status: 'failed', error: error as Error });
    } finally {
      this.isSyncing = false;
    }
  }

  private async fetchServerNotes(oxyServices: OxyServices, activeSessionId: string): Promise<Note[]> {
    try {
      const result = await notesApi.getAllNotes(oxyServices, activeSessionId);
      return result.notes || [];
    } catch (error) {
      console.error('Failed to fetch server notes:', error);
      return [];
    }
  }

  private async processPendingSyncs(oxyServices: OxyServices, activeSessionId: string): Promise<void> {
    const pendingSyncs = await storageManager.getPendingSyncs();
    
    for (const sync of pendingSyncs) {
      try {
        switch (sync.action) {
          case 'create':
            if (sync.noteData && sync.noteData.title && sync.noteData.content) {
              const createData: CreateNoteData = {
                title: sync.noteData.title,
                content: sync.noteData.content,
                color: sync.noteData.color,
              };
              const result = await notesApi.createNote(createData, oxyServices, activeSessionId);
              // Update local note with server ID
              const localNote = await storageManager.getNoteById(sync.id);
              if (localNote) {
                localNote.id = result.note.id;
                localNote.syncStatus = 'synced';
                await storageManager.saveNote(localNote);
              }
            }
            break;
          case 'update':
            if (sync.noteData && sync.noteData.title && sync.noteData.content) {
              const localNote = await storageManager.getNoteById(sync.id);
              if (localNote && localNote.id && !localNote.id.startsWith('local_')) {
                const updateData: CreateNoteData = {
                  title: sync.noteData.title,
                  content: sync.noteData.content,
                  color: sync.noteData.color,
                };
                await notesApi.updateNote(localNote.id, updateData, oxyServices, activeSessionId);
                localNote.syncStatus = 'synced';
                await storageManager.saveNote(localNote);
              }
            }
            break;
          case 'delete':
            const localNote = await storageManager.getNoteById(sync.id);
            if (localNote && localNote.id && !localNote.id.startsWith('local_')) {
              await notesApi.deleteNote(localNote.id, oxyServices, activeSessionId);
            }
            break;
          case 'archive':
            const archivedNote = await storageManager.getNoteById(sync.id);
            if (archivedNote && archivedNote.id && !archivedNote.id.startsWith('local_')) {
              await notesApi.archiveNote(archivedNote.id, oxyServices, activeSessionId);
              archivedNote.syncStatus = 'synced';
              await storageManager.saveNote(archivedNote);
            }
            break;
          case 'unarchive':
            const unarchiveNote = await storageManager.getNoteById(sync.id);
            if (unarchiveNote && unarchiveNote.id && !unarchiveNote.id.startsWith('local_')) {
              await notesApi.unarchiveNote(unarchiveNote.id, oxyServices, activeSessionId);
              unarchiveNote.syncStatus = 'synced';
              await storageManager.saveNote(unarchiveNote);
            }
            break;
        }
        
        // Remove from pending syncs
        await storageManager.removePendingSync(sync.id);
      } catch (error) {
        console.error(`Failed to sync ${sync.action} for note ${sync.id}:`, error);
        // Keep in pending queue for next sync attempt
      }
    }
  }

  private async mergeServerNotes(serverNotes: Note[]): Promise<void> {
    const localNotes = await storageManager.getAllNotes();
    
    for (const serverNote of serverNotes) {
      const existingLocal = localNotes.find(ln => ln.id === serverNote.id);
      
      if (!existingLocal) {
        // New note from server
        const storedNote: StoredNote = {
          ...serverNote,
          localId: storageManager.generateLocalId(),
          lastModified: new Date(serverNote.updatedAt).getTime(),
          syncStatus: 'synced',
        };
        await storageManager.saveNote(storedNote);
      } else {
        // Check for conflicts
        const serverModified = new Date(serverNote.updatedAt).getTime();
        if (serverModified > existingLocal.lastModified && existingLocal.syncStatus === 'synced') {
          // Server version is newer, update local
          existingLocal.title = serverNote.title;
          existingLocal.content = serverNote.content;
          existingLocal.color = serverNote.color;
          existingLocal.archived = serverNote.archived;
          existingLocal.updatedAt = serverNote.updatedAt;
          existingLocal.lastModified = serverModified;
          await storageManager.saveNote(existingLocal);
        }
      }
    }
  }

  private async addToPendingSync(sync: PendingSync): Promise<void> {
    await storageManager.addPendingSync(sync);
  }

  // Utility Methods
  async forceSyncNote(localId: string, oxyServices: OxyServices, activeSessionId: string): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    const note = await storageManager.getNoteById(localId);
    if (!note) {
      throw new Error('Note not found');
    }

    try {
      if (note.id.startsWith('local_')) {
        // Create new note on server
        const result = await notesApi.createNote({
          title: note.title,
          content: note.content,
          color: note.color,
        }, oxyServices, activeSessionId);
        
        note.id = result.note.id;
        note.syncStatus = 'synced';
        await storageManager.saveNote(note);
      } else {
        // Update existing note on server
        await notesApi.updateNote(note.id, {
          title: note.title,
          content: note.content,
          color: note.color,
        }, oxyServices, activeSessionId);
        
        note.syncStatus = 'synced';
        await storageManager.saveNote(note);
      }
    } catch (error) {
      console.error('Failed to force sync note:', error);
      throw error;
    }
  }

  async getPendingSyncCount(): Promise<number> {
    const pendingSyncs = await storageManager.getPendingSyncs();
    return pendingSyncs.length;
  }
}

export interface SyncStatus {
  status: 'syncing' | 'completed' | 'failed' | 'idle';
  progress?: number;
  error?: Error;
}

export const syncManager = new SyncManager();
