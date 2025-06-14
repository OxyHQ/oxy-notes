import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { StoredNote } from '../../utils/storage';
import { Ionicons } from '@expo/vector-icons';

interface NoteCardProps {
  note: StoredNote;
  onPress: () => void;
  onLongPress?: () => void;
  containerStyle?: ViewStyle;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onPress, onLongPress, containerStyle }) => {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: note.color }, containerStyle]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
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
      <Text style={styles.content} numberOfLines={4}>
        {note.content}
      </Text>
      <Text style={styles.date}>
        {new Date(note.updatedAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 8,
    marginHorizontal: 4,
    minWidth: 150,
    flex: 1,
    borderWidth: 1,
    borderColor: '#858585',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  syncIndicator: {
    marginLeft: 8,
  }
});

export default NoteCard;
