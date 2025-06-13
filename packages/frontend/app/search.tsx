import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
} from 'react-native';
import { useOxy } from '@oxyhq/services';
import { router } from 'expo-router';
import { notesApi, Note } from '../utils/api';

export default function SearchScreen() {
  const { user, oxyServices, activeSessionId } = useOxy();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 48) / 2;

  const fetchAllNotes = useCallback(async () => {
    if (!activeSessionId || !oxyServices) return;

    try {
      const result = await notesApi.getAllNotes(oxyServices, activeSessionId);
      setAllNotes(result.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
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
      setSearchResults([]);
    }
  }, [searchQuery, allNotes]);

  const openNote = (note: Note) => {
    router.push({
      pathname: '/edit-note',
      params: { noteId: note.id }
    });
  };

  const renderNote = (note: Note) => (
    <TouchableOpacity
      key={note.id}
      style={[
        styles.noteCard,
        { backgroundColor: note.color, width: itemWidth },
      ]}
      onPress={() => openNote(note)}
    >
      <Text style={styles.noteTitle} numberOfLines={2}>
        {note.title || 'Untitled'}
      </Text>
      <Text style={styles.noteContent} numberOfLines={6}>
        {note.content}
      </Text>
      <Text style={styles.noteDate}>
        {new Date(note.updatedAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.authPrompt}>
          <Text style={styles.authPromptIcon}>🔍</Text>
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
        <Text style={styles.searchIcon}>🔍</Text>
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
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      <ScrollView style={styles.resultsContainer}>
        {!searchQuery.trim() ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📝</Text>
            <Text style={styles.emptyStateTitle}>Start Searching</Text>
            <Text style={styles.emptyStateText}>
              Type in the search bar to find your notes by title or content
            </Text>
            <Text style={styles.statsText}>
              {allNotes.length} notes available to search
            </Text>
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
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
    backgroundColor: '#fafafa',
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
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#999',
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
