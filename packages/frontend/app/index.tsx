import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Dimensions,
  TextInput,
} from 'react-native';
import { useOxy } from '@oxyhq/services';
import { OxySignInButton } from '@oxyhq/services/full';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOfflineNotes } from '../ui/hooks/useOfflineNotes';
import { StoredNote } from '../utils/storage';

export default function NotesScreen() {
  const { user } = useOxy();
  const {
    notes,
    isLoading,
    isOnline,
    syncStatus,
    pendingSyncCount,
    deleteNote,
    refresh,
  } = useOfflineNotes();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = viewMode === 'grid' ? (screenWidth - 48) / 2 : screenWidth - 32;

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteNote = async (note: StoredNote) => {
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
              await deleteNote(note.localId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const openNote = (note: StoredNote) => {
    router.push({
      pathname: '/edit-note',
      params: { noteId: note.localId }
    });
  };

  const renderNote = (note: StoredNote) => (
    <TouchableOpacity
      key={note.localId}
      style={[
        styles.noteCard,
        { backgroundColor: note.color, width: itemWidth },
        viewMode === 'list' && styles.listNote,
      ]}
      onPress={() => openNote(note)}
      onLongPress={() => handleDeleteNote(note)}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle} numberOfLines={2}>
          {note.title || 'Untitled'}
        </Text>
        {note.syncStatus === 'pending' && (
          <View style={styles.syncIndicator}>
            {(() => {
              const IconComponent = Ionicons as any;
              return (
                <IconComponent
                  name="time"
                  size={12}
                  color="#ffc107"
                />
              );
            })()}
          </View>
        )}
      </View>
      <Text style={styles.noteContent} numberOfLines={viewMode === 'grid' ? 6 : 3}>
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
        <View style={styles.welcomeContainer}>
          {(() => {
            const IconComponent = Ionicons as any;
            return (
              <IconComponent
                name="document-text"
                size={80}
                color="#ffc107"
                style={styles.welcomeIcon}
              />
            );
          })()}
          <Text style={styles.welcomeTitle}>Welcome to Noted</Text>
          <Text style={styles.welcomeSubtitle}>
            Your personal note-taking app with offline sync
          </Text>
          <View style={styles.signInContainer}>
            <OxySignInButton />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>My Notes</Text>
          <View style={styles.headerActions}>
            {!isOnline && (
              <View style={styles.offlineIndicator}>
                {(() => {
                  const IconComponent = Ionicons as any;
                  return (
                    <IconComponent
                      name="cloud-offline"
                      size={10}
                      color="#fff"
                      style={{ marginRight: 4 }}
                    />
                  );
                })()}
                <Text style={styles.offlineText}>Offline</Text>
              </View>
            )}
            {pendingSyncCount > 0 && (
              <View style={styles.pendingIndicator}>
                <Text style={styles.pendingText}>{pendingSyncCount} pending</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.viewToggle}
              onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {(() => {
                const IconComponent = Ionicons as any;
                return (
                  <IconComponent
                    name={viewMode === 'grid' ? 'list' : 'grid'}
                    size={20}
                    color="#666"
                  />
                );
              })()}
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          {(() => {
            const IconComponent = Ionicons as any;
            return (
              <IconComponent
                name="search"
                size={16}
                color="#666"
                style={styles.searchIcon}
              />
            );
          })()}
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
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
      </View>

      {/* Sync Status */}
      {syncStatus.status === 'syncing' && (
        <View style={styles.syncStatus}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            {(() => {
              const IconComponent = Ionicons as any;
              return (
                <IconComponent
                  name="sync"
                  size={14}
                  color="#1976d2"
                  style={{ marginRight: 8 }}
                />
              );
            })()}
            <Text style={styles.syncStatusText}>
              Syncing... {syncStatus.progress || 0}%
            </Text>
          </View>
        </View>
      )}

      {/* Notes List */}
      <ScrollView 
        style={styles.notesContainer}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
      >
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            {(() => {
              const IconComponent = Ionicons as any;
              return (
                <IconComponent
                  name="document-text"
                  size={80}
                  color="#ccc"
                  style={styles.emptyIcon}
                />
              );
            })()}
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No matching notes' : 'No notes yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery 
                ? 'Try a different search term' 
                : 'Tap the + button to create your first note'
              }
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => router.push('/create-note')}
              >
                <Text style={styles.createButtonText}>Create Note</Text>
              </TouchableOpacity>
            )}
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
      {notes.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/create-note')}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  welcomeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  welcomeIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  signInContainer: {
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  offlineIndicator: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offlineText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  pendingIndicator: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '600',
  },
  viewToggle: {
    padding: 4,
  },
  viewToggleText: {
    fontSize: 20,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearIcon: {
    fontSize: 16,
    color: '#666',
    padding: 4,
  },
  syncStatus: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  syncStatusText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
  },
  notesContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  createButton: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  listNote: {
    width: '100%',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noteTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  syncIndicator: {
    marginLeft: 8,
  },
  syncText: {
    fontSize: 12,
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
  fabText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
});
