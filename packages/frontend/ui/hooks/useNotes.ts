import { useState, useEffect, useCallback } from 'react';
import { useOxy } from '@oxyhq/services';
import { Alert } from 'react-native';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export const useNotes = () => {
  const { activeSessionId } = useOxy();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!activeSessionId) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/notes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${activeSessionId}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setNotes(result.notes || []);
      } else {
        console.error('Failed to fetch notes:', result.error);
        Alert.alert('Error', 'Failed to fetch notes');
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      Alert.alert('Error', 'Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId]);

  const createNote = async (noteData: { title: string; content: string; color?: string }) => {
    if (!activeSessionId) {
      Alert.alert('Error', 'Please sign in to create notes');
      return null;
    }

    try {
      const response = await fetch('http://localhost:4000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeSessionId}`,
        },
        body: JSON.stringify({
          title: noteData.title,
          content: noteData.content,
          color: noteData.color || '#ffffff',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setNotes(prev => [...prev, result.note]);
        return result.note;
      } else {
        Alert.alert('Error', result.message || 'Failed to create note');
        return null;
      }
    } catch (error) {
      console.error('Error creating note:', error);
      Alert.alert('Error', 'Failed to create note');
      return null;
    }
  };

  const updateNote = async (noteId: string, noteData: { title?: string; content?: string; color?: string }) => {
    if (!activeSessionId) {
      Alert.alert('Error', 'Please sign in to update notes');
      return false;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeSessionId}`,
        },
        body: JSON.stringify(noteData),
      });

      const result = await response.json();

      if (result.success) {
        setNotes(prev => prev.map(note => 
          note.id === noteId ? result.note : note
        ));
        return true;
      } else {
        Alert.alert('Error', result.message || 'Failed to update note');
        return false;
      }
    } catch (error) {
      console.error('Error updating note:', error);
      Alert.alert('Error', 'Failed to update note');
      return false;
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!activeSessionId) {
      Alert.alert('Error', 'Please sign in to delete notes');
      return false;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${activeSessionId}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
        return true;
      } else {
        Alert.alert('Error', result.message || 'Failed to delete note');
        return false;
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      Alert.alert('Error', 'Failed to delete note');
      return false;
    }
  };

  const getNoteById = useCallback((noteId: string) => {
    return notes.find(note => note.id === noteId);
  }, [notes]);

  useEffect(() => {
    if (activeSessionId) {
      fetchNotes();
    }
  }, [activeSessionId, fetchNotes]);

  return {
    notes,
    isLoading,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    getNoteById,
  };
};
