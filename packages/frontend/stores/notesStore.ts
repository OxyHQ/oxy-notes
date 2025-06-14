import { create } from 'zustand';
import { OxyServices } from '@oxyhq/services';
import { syncManager, SyncStatus } from '../utils/syncManager';
import { StoredNote } from '../utils/storage';

interface NotesState {
  // State
  notes: StoredNote[];
  isLoading: boolean;
  isOnline: boolean;
  syncStatus: SyncStatus;
  pendingSyncCount: number;

  // Actions
  setNotes: (notes: StoredNote[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsOnline: (isOnline: boolean) => void;
  setSyncStatus: (syncStatus: SyncStatus) => void;
  setPendingSyncCount: (count: number) => void;
  
  // Async actions
  loadNotes: () => Promise<void>;
  createNote: (noteData: { title: string; content: string; color?: string }, oxyServices?: OxyServices, activeSessionId?: string) => Promise<StoredNote>;
  updateNote: (localId: string, noteData: { title: string; content: string; color?: string }, oxyServices?: OxyServices, activeSessionId?: string) => Promise<StoredNote>;
  deleteNote: (localId: string, oxyServices?: OxyServices, activeSessionId?: string) => Promise<void>;
  getNoteById: (localId: string) => Promise<StoredNote | null>;
  syncNotes: (oxyServices?: OxyServices, activeSessionId?: string) => Promise<void>;
  forceSyncNote: (localId: string, oxyServices: OxyServices, activeSessionId: string) => Promise<void>;
  refresh: (oxyServices?: OxyServices, activeSessionId?: string, user?: any) => Promise<void>;
  
  // Store initialization
  initialize: () => void;
  cleanup: () => void;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  // Initial state
  notes: [],
  isLoading: true,
  isOnline: true,
  syncStatus: { status: 'idle' },
  pendingSyncCount: 0,

  // Basic setters
  setNotes: (notes) => set({ notes }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsOnline: (isOnline) => set({ isOnline }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  setPendingSyncCount: (pendingSyncCount) => set({ pendingSyncCount }),

  // Load notes from storage
  loadNotes: async () => {
    try {
      console.log('Loading notes from storage...');
      set({ isLoading: true });
      const storedNotes = await syncManager.getAllNotes();
      const pendingCount = await syncManager.getPendingSyncCount();
      
      console.log(`Loaded ${storedNotes.length} notes, ${pendingCount} pending sync`);
      set({ 
        notes: storedNotes, 
        pendingSyncCount: pendingCount 
      });
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Create note
  createNote: async (noteData, oxyServices, activeSessionId) => {
    try {
      const newNote = await syncManager.createNote(noteData, oxyServices, activeSessionId);
      await get().loadNotes(); // Refresh the list
      return newNote;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  // Update note
  updateNote: async (localId, noteData, oxyServices, activeSessionId) => {
    try {
      const updatedNote = await syncManager.updateNote(localId, noteData, oxyServices, activeSessionId);
      await get().loadNotes(); // Refresh the list
      return updatedNote;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  // Delete note
  deleteNote: async (localId, oxyServices, activeSessionId) => {
    try {
      await syncManager.deleteNote(localId, oxyServices, activeSessionId);
      await get().loadNotes(); // Refresh the list
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },

  // Get note by ID
  getNoteById: async (localId) => {
    try {
      return await syncManager.getNoteById(localId);
    } catch (error) {
      console.error('Error getting note by id:', error);
      throw error;
    }
  },

  // Sync notes
  syncNotes: async (oxyServices, activeSessionId) => {
    if (!oxyServices || !activeSessionId) {
      throw new Error('Authentication required for sync');
    }
    try {
      await syncManager.syncNotes(oxyServices, activeSessionId);
    } catch (error) {
      console.error('Error syncing notes:', error);
      throw error;
    }
  },

  // Force sync note
  forceSyncNote: async (localId, oxyServices, activeSessionId) => {
    if (!oxyServices || !activeSessionId) {
      throw new Error('Authentication required for sync');
    }
    try {
      await syncManager.forceSyncNote(localId, oxyServices, activeSessionId);
      await get().loadNotes(); // Refresh the list
    } catch (error) {
      console.error('Error force syncing note:', error);
      throw error;
    }
  },

  // Refresh
  refresh: async (oxyServices, activeSessionId, user) => {
    await get().loadNotes();
    if (user && oxyServices && activeSessionId && get().isOnline) {
      await syncManager.syncNotes(oxyServices, activeSessionId);
    }
  },

  // Initialize store (set up listeners, etc.)
  initialize: () => {
    const state = get();
    
    // Prevent multiple initializations
    if (state.cleanup !== get().cleanup) {
      console.log('Store already initialized, skipping...');
      return;
    }

    console.log('Initializing notes store...');

    // Set up sync status listener
    const handleSyncStatus = (status: SyncStatus) => {
      console.log('Sync status changed:', status);
      set({ syncStatus: status });
      if (status.status === 'completed') {
        // Reload notes after successful sync
        get().loadNotes().catch((error) => {
          console.error('Failed to reload notes after sync:', error);
        });
      }
    };

    syncManager.addSyncListener(handleSyncStatus);

    // Update network status
    const updateNetworkStatus = () => {
      try {
        const isOnline = syncManager.getNetworkStatus();
        const currentOnline = get().isOnline;
        if (isOnline !== currentOnline) {
          console.log('Network status changed:', isOnline ? 'online' : 'offline');
          set({ isOnline });
        }
      } catch (error) {
        console.error('Error updating network status:', error);
      }
    };

    // Initial network status
    updateNetworkStatus();

    // Set up periodic network status checks
    const networkInterval = setInterval(updateNetworkStatus, 5000);

    // Create cleanup function
    const cleanupFn = () => {
      console.log('Cleaning up notes store...');
      syncManager.removeSyncListener(handleSyncStatus);
      clearInterval(networkInterval);
    };

    // Store the cleanup function in the store
    set({ cleanup: cleanupFn });

    // Initial load
    get().loadNotes().catch((error) => {
      console.error('Failed to load initial notes:', error);
    });
  },

  // Cleanup (remove listeners, etc.)
  cleanup: () => {
    // Default cleanup function - will be replaced during initialization
  },
}));