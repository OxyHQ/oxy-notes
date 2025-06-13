import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

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

export default function NotesScreen() {
  const { user, oxyServices, activeSessionId } = useOxy();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const screenWidth = Dimensions.get('window').width;
  const numColumns = viewMode === 'grid' ? 2 : 1;
  const itemWidth = viewMode === 'grid' ? (screenWidth - 40) / 2 - 10 : screenWidth - 40;

  useEffect(() => {
    fetchNotes();
  }, [activeSessionId]);

  const fetchNotes = async () => {
    if (!activeSessionId || !oxyServices) return;

    setIsLoading(true);
    try {
      const response = await oxyServices.makeAuthenticatedRequest('/api/notes', {
        method: 'GET',
      });

      if (response.success) {
        setNotes(response.notes || []);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      Alert.alert('Error', 'Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

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
          <Ionicons name="person-circle-outline" size={80} color="#666" />
          <Text style={styles.authPromptTitle}>Welcome to Noted</Text>
          <Text style={styles.authPromptText}>
            Please sign in to access your notes
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your notes"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>
        <TouchableOpacity
          style={styles.viewModeButton}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          <Ionicons
            name={viewMode === 'grid' ? 'list' : 'grid'}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
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
            <Ionicons name="document-text-outline" size={80} color="#ccc" />
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
        <Ionicons name="add" size={24} color="#fff" />
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginRight: 12,
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
    backgroundColor: '#1976d2',
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
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
