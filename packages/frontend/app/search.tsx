import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { useOxy } from '@oxyhq/services';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { notesApi, Note } from '../utils/api';
import NoteCard from '../ui/components/NoteCard';
import { syncManager } from '../utils/syncManager';
import { StoredNote } from '../utils/storage';

// Create StoredNote adapter from server Note
const adaptNoteToStoredFormat = (note: Note) => {
  // Safe conversion of Note to StoredNote
  return {
    ...note,
    localId: note.id || `temp-${Date.now()}`,
    lastModified: note.updatedAt ? new Date(note.updatedAt).getTime() : Date.now(),
    syncStatus: 'synced' as const
  };
};

export default function SearchScreen() {
  const { user, oxyServices, activeSessionId } = useOxy();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 48) / 2;

  const fetchAllNotes = useCallback(async () => {
    if (!activeSessionId || !oxyServices) {
      console.log('Search: Missing session or services', { activeSessionId, hasServices: !!oxyServices });
      return;
    }

    try {
      console.log('Search: Fetching notes...');
      const result = await notesApi.getAllNotes(oxyServices, activeSessionId);
      console.log('Search: Notes fetched:', result.notes?.length || 0);
      setAllNotes(result.notes || []);
    } catch (error) {
      console.error('Search: Error fetching notes:', error);
    }
  }, [activeSessionId, oxyServices]);

  useEffect(() => {
    if (user && activeSessionId && oxyServices) {
      fetchAllNotes();
    }
  }, [user, activeSessionId, oxyServices, fetchAllNotes]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allNotes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filtered);
    } else {
      // When no search query, show all notes
      setSearchResults(allNotes);
    }
  }, [searchQuery, allNotes]);

  const handleDeleteNote = async (note: Note) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (oxyServices && activeSessionId) {
                await notesApi.deleteNote(note.id, oxyServices, activeSessionId);
                // Refresh notes after deletion
                fetchAllNotes();
              } else {
                Alert.alert('Error', 'Authentication required');
              }
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const handleArchiveNote = async (note: Note) => {
    Alert.alert(
      'Archive Note',
      'Archive this note? You can access it later in the archive section.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          onPress: async () => {
            try {
              // In a real implementation, you would call something like:
              // await archiveNote(note.id);
              Alert.alert('Info', 'Archive functionality will be implemented soon');
            } catch (error) {
              console.error('Error archiving note:', error);
              Alert.alert('Error', 'Failed to archive note');
            }
          },
        },
      ]
    );
  };

  const openNote = (note: Note) => {
    console.log('Opening note:', note);
    
    if (!note || !note.id) {
      console.error('Invalid note object:', note);
      Alert.alert('Error', 'Cannot open invalid note');
      return;
    }
    
    // First, try to find the note in offline storage to get the localId
    try {
      // We'll need to check if this note exists locally and get its localId
      syncManager.getNoteById(note.id)
        .then((localNote) => {
          if (localNote) {
            console.log('Found local note with localId:', localNote.localId);
            router.push({
              pathname: '/edit-note',
              params: { noteId: localNote.localId }
            });
          } else {
            // If not found locally, we need to create a local copy from the server note
            console.log('Note not found locally, creating local version from server note');
            // Create a note with the same content
            syncManager.createNote({
                title: note.title,
                content: note.content,
                color: note.color
              })
              .then((createdNote) => {
                router.push({
                  pathname: '/edit-note',
                  params: { noteId: createdNote.localId }
                });
              })
              .catch((error: Error) => {
                console.error('Failed to create local copy of server note:', error);
                Alert.alert('Error', 'Failed to open note');
              });
          }
        })
        .catch((error: Error) => {
          console.error('Error checking for local note:', error);
          Alert.alert('Error', 'Failed to open note');
        });
    } catch (error) {
      console.error('Error opening note:', error);
      Alert.alert('Error', 'Failed to open note');
    }
  };

  const renderNote = (note: Note) => {
    // Confirm note has all required properties
    if (!note || !note.id) {
      console.error('Invalid note object:', note);
      return null;
    }
    return (
      <NoteCard
        key={note.id}
        note={adaptNoteToStoredFormat(note)}
        onPress={() => openNote(note)}
        containerStyle={{ width: itemWidth }}
        limitContentLines={4}
        searchQuery={searchQuery}
        onDelete={() => handleDeleteNote(note)}
        onArchive={() => handleArchiveNote(note)}
      />
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.authPrompt}>
          {(() => {
            const IconComponent = Ionicons as any;
            return (
              <IconComponent
                name="search"
                size={80}
                color="#ccc"
                style={styles.authPromptIcon}
              />
            );
          })()}
          <Text style={styles.authPromptTitle}>Search Your Notes</Text>
          <Text style={styles.authPromptText}>
            Please sign in to search through your notes
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search Notes</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        {(() => {
          const IconComponent = Ionicons as any;
          return (
            <IconComponent
              name="search"
              size={18}
              color="#666"
              style={styles.searchIcon}
            />
          );
        })()}
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes by title or content..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
          autoFocus
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            {(() => {
              const IconComponent = Ionicons as any;
              return (
                <IconComponent
                  name="close"
                  size={16}
                  color="#666"
                />
              );
            })()}
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      <ScrollView style={styles.resultsContainer}>
        {!searchQuery.trim() && allNotes.length === 0 ? (
          <View style={styles.emptyState}>
            {(() => {
              const IconComponent = Ionicons as any;
              return (
                <IconComponent
                  name="document-text"
                  size={80}
                  color="#ccc"
                  style={styles.emptyStateIcon}
                />
              );
            })()}
            <Text style={styles.emptyStateTitle}>No Notes Found</Text>
            <Text style={styles.emptyStateText}>
              You don&apos;t have any notes yet. Create some notes to search through them.
            </Text>
          </View>
        ) : !searchQuery.trim() ? (
          <>
            <Text style={styles.resultsHeader}>
              All Notes ({allNotes.length})
            </Text>
            <View style={styles.notesGrid}>
              {searchResults.map(renderNote)}
            </View>
          </>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyState}>
            {(() => {
              const IconComponent = Ionicons as any;
              return (
                <IconComponent
                  name="search"
                  size={80}
                  color="#ccc"
                  style={styles.emptyStateIcon}
                />
              );
            })()}
            <Text style={styles.emptyStateTitle}>No Results Found</Text>
            <Text style={styles.emptyStateText}>
              No notes match &ldquo;{searchQuery}&rdquo;. Try different keywords.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.resultsHeader}>
              Found {searchResults.length} note{searchResults.length !== 1 ? 's' : ''}
            </Text>
            <View style={styles.notesGrid}>
              {searchResults.map(renderNote)}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: '#666',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginVertical: 12,
  },
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  statsText: {
    fontSize: 12,
    color: '#ccc',
    marginTop: 16,
  },
  authPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  authPromptIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  authPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  authPromptText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
