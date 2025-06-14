import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Animated, Easing, Platform } from 'react-native';
import { StoredNote } from '../../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useHover } from '../../hooks/useHover';

interface NoteCardProps {
  note: StoredNote;
  onPress: () => void;
  onLongPress?: () => void;
  onDelete?: (note: StoredNote) => void;
  onArchive?: (note: StoredNote) => void;
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

const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onPress, 
  onLongPress, 
  onDelete, 
  onArchive, 
  containerStyle, 
  limitContentLines, 
  searchQuery 
}) => {
  // Use the hover hook for web platforms
  const { isHovered, hoverProps } = useHover();
  const isWeb = Platform.OS === 'web';
  
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
      {...hoverProps}
    >
      {/* Hover Action Buttons for Web */}
      {isWeb && isHovered && (onDelete || onArchive) && (
        <View style={styles.hoverActions}>
          {onDelete && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation(); // Prevent triggering the parent's onPress
                onDelete(note);
              }}
            >
              {(() => {
                const IconComponent = Ionicons as any;
                return (
                  <IconComponent
                    name="trash-outline"
                    size={16}
                    color="#ff5252"
                  />
                );
              })()}
            </TouchableOpacity>
          )}
          {onArchive && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation(); // Prevent triggering the parent's onPress
                onArchive(note);
              }}
            >
              {(() => {
                const IconComponent = Ionicons as any;
                return (
                  <IconComponent
                    name="archive-outline"
                    size={16}
                    color="#333"
                  />
                );
              })()}
            </TouchableOpacity>
          )}
        </View>
      )}

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
    position: 'relative', // For absolute positioning of hover actions
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
  },
  // Hover action styles
  hoverActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  }
});

export default NoteCard;
