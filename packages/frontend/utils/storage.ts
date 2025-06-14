import AsyncStorage from '@react-native-async-storage/async-storage';
import { Note } from './api';

const STORAGE_KEYS = {
  NOTES: 'notes_offline',
  PENDING_SYNC: 'pending_sync',
  LAST_SYNC: 'last_sync',
  USER_ID: 'user_id',
};

export interface PendingSync {
  id: string;
  action: 'create' | 'update' | 'delete';
  noteData?: Partial<Note>;
  timestamp: number;
}

export interface StoredNote extends Note {
  localId: string;
  lastModified: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

class StorageManager {
  // Notes Management
  async getAllNotes(): Promise<StoredNote[]> {
    try {
      const notesJson = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
      return notesJson ? JSON.parse(notesJson) : [];
    } catch (error) {
      console.error('Error getting notes from storage:', error);
      return [];
    }
  }

  async saveNote(note: StoredNote): Promise<void> {
    try {
      const notes = await this.getAllNotes();
      const existingIndex = notes.findIndex(n => n.localId === note.localId);
      
      if (existingIndex >= 0) {
        notes[existingIndex] = note;
      } else {
        notes.push(note);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving note to storage:', error);
      throw error;
    }
  }

  async deleteNote(localId: string): Promise<void> {
    try {
      const notes = await this.getAllNotes();
      const filteredNotes = notes.filter(n => n.localId !== localId);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(filteredNotes));
    } catch (error) {
      console.error('Error deleting note from storage:', error);
      throw error;
    }
  }

  async getNoteById(localId: string): Promise<StoredNote | null> {
    try {
      const notes = await this.getAllNotes();
      return notes.find(n => n.localId === localId) || null;
    } catch (error) {
      console.error('Error getting note by id:', error);
      return null;
    }
  }

  // Sync Management
  async getPendingSyncs(): Promise<PendingSync[]> {
    try {
      const syncsJson = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_SYNC);
      return syncsJson ? JSON.parse(syncsJson) : [];
    } catch (error) {
      console.error('Error getting pending syncs:', error);
      return [];
    }
  }

  async addPendingSync(sync: PendingSync): Promise<void> {
    try {
      const syncs = await this.getPendingSyncs();
      syncs.push(sync);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(syncs));
    } catch (error) {
      console.error('Error adding pending sync:', error);
      throw error;
    }
  }

  async removePendingSync(syncId: string): Promise<void> {
    try {
      const syncs = await this.getPendingSyncs();
      const filteredSyncs = syncs.filter(s => s.id !== syncId);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_SYNC, JSON.stringify(filteredSyncs));
    } catch (error) {
      console.error('Error removing pending sync:', error);
      throw error;
    }
  }

  async clearPendingSyncs(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_SYNC);
    } catch (error) {
      console.error('Error clearing pending syncs:', error);
      throw error;
    }
  }

  async getPendingSyncsCount(): Promise<number> {
    try {
      const syncs = await this.getPendingSyncs();
      return syncs.length;
    } catch (error) {
      console.error('Error getting pending syncs count:', error);
      return 0;
    }
  }

  // Last Sync Management
  async getLastSyncTime(): Promise<number> {
    try {
      const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return lastSync ? parseInt(lastSync, 10) : 0;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return 0;
    }
  }

  async setLastSyncTime(timestamp: number): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp.toString());
    } catch (error) {
      console.error('Error setting last sync time:', error);
      throw error;
    }
  }

  // User Management
  async setCurrentUserId(userId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    } catch (error) {
      console.error('Error setting user id:', error);
      throw error;
    }
  }

  async getCurrentUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    } catch (error) {
      console.error('Error getting user id:', error);
      return null;
    }
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.NOTES,
        STORAGE_KEYS.PENDING_SYNC,
        STORAGE_KEYS.LAST_SYNC,
        STORAGE_KEYS.USER_ID,
      ]);
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const storageManager = new StorageManager();
