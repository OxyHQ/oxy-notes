import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useOfflineNotes } from '../ui/hooks/useOfflineNotes';
import { StoredNote } from '../utils/storage';

const COLORS = [
  '#ffffff', // White (default)
  '#f28b82', // Red
  '#fbbc04', // Yellow
  '#fff475', // Light Yellow
  '#ccff90', // Light Green
  '#a7ffeb', // Teal
  '#cbf0f8', // Light Blue
  '#aecbfa', // Blue
  '#d7aefb', // Purple
  '#fdcfe8', // Pink
  '#e6c9a8', // Brown
  '#e8eaed', // Gray
];

export default function EditNoteScreen() {
  const { noteId } = useLocalSearchParams();
  const { getNoteById, updateNote, deleteNote } = useOfflineNotes();
  const [note, setNote] = useState<StoredNote | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNote = useCallback(async () => {
    if (!noteId) return;

    setIsLoading(true);
    try {
      const foundNote = await getNoteById(noteId as string);
      
      if (foundNote) {
        setNote(foundNote);
        setTitle(foundNote.title);
        setContent(foundNote.content);
        setSelectedColor(foundNote.color);
      } else {
        Alert.alert('Error', 'Note not found');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching note:', error);
      Alert.alert('Error', 'Failed to load note');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [noteId, getNoteById]);

  useEffect(() => {
    if (noteId) {
      fetchNote();
    }
  }, [fetchNote, noteId]);

  const saveNote = async () => {
    if (!noteId) {
      Alert.alert('Error', 'Note ID is missing');
      return;
    }

    if (!title.trim() && !content.trim()) {
      Alert.alert('Error', 'Please add some content to your note');
      return;
    }

    setIsSaving(true);
    try {
      await updateNote(noteId as string, {
        title: title.trim(),
        content: content.trim(),
        color: selectedColor,
      });

      Alert.alert('Success', 'Note updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating note:', error);
      Alert.alert('Error', 'Failed to update note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!noteId) return;

    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(noteId as string);
              
              Alert.alert('Success', 'Note deleted successfully', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note. Please try again.');
            }
          },
        },
      ]
    );
  };

  const cancel = () => {
    if (note && (title !== note.title || content !== note.content || selectedColor !== note.color)) {
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading note...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={cancel}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Note</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleDeleteNote}>
            <Text style={[styles.headerButtonText, styles.deleteButton]}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerButton, isSaving && styles.disabledButton]} 
            onPress={saveNote}
            disabled={isSaving}
          >
            <Text style={[styles.headerButtonText, styles.saveButton]}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: selectedColor }]}>
        {/* Title Input */}
        <TextInput
          style={styles.titleInput}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor="#999"
          multiline
        />

        {/* Content Input */}
        <TextInput
          style={styles.contentInput}
          placeholder="Take a note..."
          value={content}
          onChangeText={setContent}
          placeholderTextColor="#999"
          multiline
          textAlignVertical="top"
        />

        {/* Color Selector */}
        <View style={styles.colorSection}>
          <Text style={styles.colorSectionTitle}>Color</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.colorPicker}>
              {COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColor,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Note metadata */}
        {note && (
          <View style={styles.metadata}>
            <Text style={styles.metadataText}>
              Created: {new Date(note.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.metadataText}>
              Last updated: {new Date(note.updatedAt).toLocaleDateString()}
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#666',
  },
  headerActions: {
    flexDirection: 'row',
  },
  saveButton: {
    color: '#1976d2',
    fontWeight: '600',
  },
  deleteButton: {
    color: '#f44336',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 25,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 16,
  },
  contentInput: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  colorSection: {
    marginTop: 24,
    paddingVertical: 16,
  },
  colorSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  colorPicker: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  selectedColor: {
    borderColor: '#1976d2',
    borderWidth: 3,
  },
  metadata: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  metadataText: {
    fontSize: 12,
    color: '#000',
    marginBottom: 4,
  },
});
