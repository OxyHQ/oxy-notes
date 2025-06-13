import { useState, useEffect, useCallback } from 'react';
import { useOxy } from '@oxyhq/services';
import { Alert } from 'react-native';
import { notesApi, Note } from '../../utils/api';

export const useNotes = () => {
  const { activeSessionId, oxyServices } = useOxy();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!activeSessionId || !oxyServices) return;

    setIsLoading(true);
    try {
      const result = await notesApi.getAllNotes(oxyServices, activeSessionId);
      setNotes(result.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      Alert.alert('Error', 'Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId, oxyServices]);

  const createNote = async (noteData: { title: string; content: string; color?: string }) => {
    if (!activeSessionId || !oxyServices) {
      Alert.alert('Error', 'Please sign in to create notes');
      return null;
    }

    try {
      const result = await notesApi.createNote({
        title: noteData.title,
        content: noteData.content,
        color: noteData.color || '#ffffff',
      }, oxyServices, activeSessionId);

      setNotes(prev => [...prev, result.note]);
      return result.note;
    } catch (error) {
      console.error('Error creating note:', error);
      Alert.alert('Error', 'Failed to create note');
      return null;
    }
  };

  const updateNote = async (noteId: string, noteData: { title?: string; content?: string; color?: string }) => {
    if (!activeSessionId || !oxyServices) {
      Alert.alert('Error', 'Please sign in to update notes');
      return false;
    }

    try {
      const result = await notesApi.updateNote(noteId, noteData, oxyServices, activeSessionId);
      
      setNotes(prev => prev.map(note => 
        note.id === noteId ? result.note : note
      ));
      return true;
    } catch (error) {
      console.error('Error updating note:', error);
      Alert.alert('Error', 'Failed to update note');
      return false;
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!activeSessionId || !oxyServices) {
      Alert.alert('Error', 'Please sign in to delete notes');
      return false;
    }

    try {
      await notesApi.deleteNote(noteId, oxyServices, activeSessionId);
      setNotes(prev => prev.filter(note => note.id !== noteId));
      return true;
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
    if (activeSessionId && oxyServices) {
      fetchNotes();
    }
  }, [activeSessionId, oxyServices, fetchNotes]);

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
