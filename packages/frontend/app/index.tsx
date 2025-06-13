import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useOxy } from '@oxyhq/services';
import { OxySignInButton } from '@oxyhq/services/full';
import { router } from 'expo-router';
import { notesApi, Note } from '../utils/api';

export default function NotesScreen() {
  const { user, oxyServices, activeSessionId } = useOxy();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = viewMode === 'grid' ? (screenWidth - 40) / 2 - 10 : screenWidth - 40;

  const fetchNotes = useCallback(async () => {
    if (!activeSessionId || !oxyServices) return;

    try {
      const result = await notesApi.getAllNotes(activeSessionId);
      setNotes(result.notes || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      Alert.alert('Error', 'Failed to fetch notes');
    }
  }, [activeSessionId, oxyServices]);

  useEffect(() => {
    if (user && activeSessionId) {
      fetchNotes();
    }
  }, [user, activeSessionId, fetchNotes]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotes();
    setRefreshing(false);
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const createNewNote = () => {
    router.push('/create-note');
  };

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
        viewMode === 'list' && styles.listModeCard
      ]}
      onPress={() => openNote(note)}
    >
      <Text style={styles.noteTitle} numberOfLines={2}>
        {note.title || 'Untitled'}
      </Text>
      <Text style={styles.noteContent} numberOfLines={viewMode === 'grid' ? 8 : 3}>
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
          <Text style={styles.authPromptIcon}>�</Text>
          <Text style={styles.authPromptTitle}>Welcome to Noted</Text>
          <Text style={styles.authPromptText}>
            Your personal note-taking app inspired by Google Keep
          </Text>
          <Text style={styles.authPromptDescription}>
            Create, organize, and search through your notes with beautiful colors and simple design.
          </Text>
          
          <OxySignInButton 
            style={styles.signInButton}
          />
          
          <View style={styles.features}>
            <Text style={styles.featureItem}>• Create and edit notes</Text>
            <Text style={styles.featureItem}>• Choose from multiple colors</Text>
            <Text style={styles.featureItem}>• Search through your notes</Text>
            <Text style={styles.featureItem}>• Grid and list view modes</Text>
            <Text style={styles.featureItem}>• Secure authentication</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>Noted</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Text style={styles.viewModeIcon}>
              {viewMode === 'grid' ? '☰' : '⊞'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search your notes"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#666"
        />
      </View>

      {/* Notes Grid/List */}
      <ScrollView
        style={styles.notesContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📝</Text>
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? 'Try searching with different keywords'
                : 'Tap the + button to create your first note'}
            </Text>
          </View>
        ) : (
          <View style={[
            styles.notesGrid,
            viewMode === 'list' && styles.notesList
          ]}>
            {filteredNotes.map(renderNote)}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={createNewNote}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  viewModeButton: {
    padding: 8,
  },
  notesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  notesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  notesList: {
    flexDirection: 'column',
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
  listModeCard: {
    width: '100%',
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
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffc107',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  authPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  authPromptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  authPromptText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  authPromptDescription: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  signInButton: {
    marginBottom: 32,
  },
  features: {
    alignItems: 'flex-start',
  },
  featureItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  authPromptIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  viewModeIcon: {
    fontSize: 20,
    color: '#666',
  },
  emptyStateIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
});
