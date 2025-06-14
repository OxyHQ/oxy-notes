import { useEffect, useCallback } from 'react';
import { useOxy } from '@oxyhq/services';
import { useNotesStore } from '../../stores/notesStore';
import { StoredNote } from '../../utils/storage';

export interface UseOfflineNotesReturn {
  notes: StoredNote[];
  isLoading: boolean;
  isOnline: boolean;
  syncStatus: import('../../utils/syncManager').SyncStatus;
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
  
  // Get state and actions from Zustand store
  const {
    notes,
    isLoading,
    isOnline,
    syncStatus,
    pendingSyncCount,
    createNote: storeCreateNote,
    updateNote: storeUpdateNote,
    deleteNote: storeDeleteNote,
    getNoteById: storeGetNoteById,
    syncNotes: storeSyncNotes,
    forceSyncNote: storeForceSyncNote,
    refresh: storeRefresh,
    initialize,
    cleanup,
  } = useNotesStore();

  // Initialize store on mount
  useEffect(() => {
    initialize();
    return cleanup;
  }, [initialize, cleanup]);

  // Auto-sync when user becomes available
  useEffect(() => {
    if (user && oxyServices && activeSessionId && isOnline) {
      storeSyncNotes(oxyServices, activeSessionId).catch((error) => {
        console.error('Auto-sync failed:', error);
      });
    }
  }, [user, oxyServices, activeSessionId, isOnline, storeSyncNotes]);

  // Wrap store actions with Oxy service parameters
  const createNote = useCallback(async (noteData: { title: string; content: string; color?: string }) => {
    return storeCreateNote(noteData, oxyServices, activeSessionId || undefined);
  }, [storeCreateNote, oxyServices, activeSessionId]);

  const updateNote = useCallback(async (
    localId: string, 
    noteData: { title: string; content: string; color?: string }
  ) => {
    return storeUpdateNote(localId, noteData, oxyServices, activeSessionId || undefined);
  }, [storeUpdateNote, oxyServices, activeSessionId]);

  const deleteNote = useCallback(async (localId: string) => {
    return storeDeleteNote(localId, oxyServices, activeSessionId || undefined);
  }, [storeDeleteNote, oxyServices, activeSessionId]);

  const getNoteById = useCallback(async (localId: string) => {
    return storeGetNoteById(localId);
  }, [storeGetNoteById]);

  const syncNotes = useCallback(async () => {
    return storeSyncNotes(oxyServices, activeSessionId || undefined);
  }, [storeSyncNotes, oxyServices, activeSessionId]);

  const forceSyncNote = useCallback(async (localId: string) => {
    if (!oxyServices || !activeSessionId) {
      throw new Error('Authentication required for sync');
    }
    return storeForceSyncNote(localId, oxyServices, activeSessionId);
  }, [storeForceSyncNote, oxyServices, activeSessionId]);

  const refresh = useCallback(async () => {
    return storeRefresh(oxyServices, activeSessionId || undefined, user);
  }, [storeRefresh, oxyServices, activeSessionId, user]);

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
