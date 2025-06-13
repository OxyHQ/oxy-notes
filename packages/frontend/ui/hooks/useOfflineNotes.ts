import { useState, useEffect, useCallback } from 'react';
import { useOxy } from '@oxyhq/services';
import { syncManager, SyncStatus } from '../../utils/syncManager';
import { StoredNote } from '../../utils/storage';

export interface UseOfflineNotesReturn {
  notes: StoredNote[];
  isLoading: boolean;
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingSyncCount: number;
  createNote: (noteData: { title: string; content: string; color?: string }) => Promise<StoredNote>;
  updateNote: (localId: string, noteData: { title: string; content: string; color?: string }) => Promise<StoredNote>;
  deleteNote: (localId: string) => Promise<void>;
  getNoteById: (localId: string) => Promise<StoredNote | null>;
  syncNotes: () => Promise<void>;
  forceSyncNote: (localId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useOfflineNotes(): UseOfflineNotesReturn {
  const { user, oxyServices, activeSessionId } = useOxy();
  const [notes, setNotes] = useState<StoredNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'idle' });
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  // Get network status
  const isOnline = syncManager.getNetworkStatus();

  // Load notes from storage
  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedNotes = await syncManager.getAllNotes();
      setNotes(storedNotes);
      
      // Update pending sync count
      const pendingCount = await syncManager.getPendingSyncCount();
      setPendingSyncCount(pendingCount);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up sync listener
  useEffect(() => {
    const handleSyncStatus = (status: SyncStatus) => {
      setSyncStatus(status);
      if (status.status === 'completed') {
        // Reload notes after successful sync
        loadNotes();
      }
    };

    syncManager.addSyncListener(handleSyncStatus);
    return () => syncManager.removeSyncListener(handleSyncStatus);
  }, [loadNotes]);

  // Initial load
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Auto-sync when user becomes available
  useEffect(() => {
    if (user && oxyServices && activeSessionId && isOnline) {
      syncManager.syncNotes(oxyServices, activeSessionId);
    }
  }, [user, oxyServices, activeSessionId, isOnline]);

  // Note operations
  const createNote = useCallback(async (noteData: { title: string; content: string; color?: string }) => {
    try {
      const newNote = await syncManager.createNote(noteData, oxyServices, activeSessionId || undefined);
      await loadNotes(); // Refresh the list
      return newNote;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }, [oxyServices, activeSessionId, loadNotes]);

  const updateNote = useCallback(async (
    localId: string, 
    noteData: { title: string; content: string; color?: string }
  ) => {
    try {
      const updatedNote = await syncManager.updateNote(localId, noteData, oxyServices, activeSessionId || undefined);
      await loadNotes(); // Refresh the list
      return updatedNote;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }, [oxyServices, activeSessionId, loadNotes]);

  const deleteNote = useCallback(async (localId: string) => {
    try {
      await syncManager.deleteNote(localId, oxyServices, activeSessionId || undefined);
      await loadNotes(); // Refresh the list
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }, [oxyServices, activeSessionId, loadNotes]);

  const getNoteById = useCallback(async (localId: string) => {
    try {
      return await syncManager.getNoteById(localId);
    } catch (error) {
      console.error('Error getting note by id:', error);
      throw error;
    }
  }, []);

  const syncNotes = useCallback(async () => {
    if (!oxyServices || !activeSessionId) {
      throw new Error('Authentication required for sync');
    }
    try {
      await syncManager.syncNotes(oxyServices, activeSessionId);
    } catch (error) {
      console.error('Error syncing notes:', error);
      throw error;
    }
  }, [oxyServices, activeSessionId]);

  const forceSyncNote = useCallback(async (localId: string) => {
    if (!oxyServices || !activeSessionId) {
      throw new Error('Authentication required for sync');
    }
    try {
      await syncManager.forceSyncNote(localId, oxyServices, activeSessionId);
      await loadNotes(); // Refresh the list
    } catch (error) {
      console.error('Error force syncing note:', error);
      throw error;
    }
  }, [oxyServices, activeSessionId, loadNotes]);

  const refresh = useCallback(async () => {
    await loadNotes();
    if (user && oxyServices && activeSessionId && isOnline) {
      await syncManager.syncNotes(oxyServices, activeSessionId);
    }
  }, [loadNotes, user, oxyServices, activeSessionId, isOnline]);

  return {
    notes,
    isLoading,
    isOnline,
    syncStatus,
    pendingSyncCount,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
    syncNotes,
    forceSyncNote,
    refresh,
  };
}
