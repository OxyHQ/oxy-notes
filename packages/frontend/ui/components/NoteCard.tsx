import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Animated, Easing } from 'react-native';
import { StoredNote } from '../../utils/storage';
import { Ionicons } from '@expo/vector-icons';

interface NoteCardProps {
  note: StoredNote;
  onPress: () => void;
  onLongPress?: () => void;
  containerStyle?: ViewStyle;
  limitContentLines?: number;
  searchQuery?: string;
}

// Animated Sync Icon Component
const AnimatedSyncIcon = () => {
  const spinValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
  }, [spinValue]);
  
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
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
    </Animated.View>
  );
};

const NoteCard: React.FC<NoteCardProps> = ({ note, onPress, onLongPress, containerStyle, limitContentLines, searchQuery }) => {
  // Helper function to highlight text matching the search query
  const renderHighlightedText = (text: string, style: any, numberOfLines?: number) => {
    if (!searchQuery || searchQuery.trim() === '') {
      return <Text style={style} numberOfLines={numberOfLines}>{text}</Text>;
    }

    const parts = text.split(new RegExp(`(${searchQuery.trim()})`, 'gi'));
    
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {parts.map((part, index) => {
          const isMatch = part.toLowerCase() === searchQuery.trim().toLowerCase();
          return isMatch ? (
            <Text key={index} style={styles.highlight}>
              {part}
            </Text>
          ) : (
            part
          );
        })}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: note.color }, containerStyle]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {(note.title || note.syncStatus === 'pending') && (
        <View style={styles.header}>
          {note.title ? (
            renderHighlightedText(note.title, styles.title, 2)
          ) : null}
          {note.syncStatus === 'pending' && (
            <View style={styles.syncIndicator}>
              <AnimatedSyncIcon />
            </View>
          )}
        </View>
      )}
      {renderHighlightedText(
        note.content,
        [styles.content, !note.title && { marginTop: 4 }],
        limitContentLines
      )}
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
    color: '#333',
    marginBottom: 8,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  syncIndicator: {
    marginLeft: 8,
  },
  highlight: {
    backgroundColor: 'rgba(255, 193, 7, 0.3)',
    fontWeight: '500',
    flexShrink: 1,
  }
});

export default NoteCard;
