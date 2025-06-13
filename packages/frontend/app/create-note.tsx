import React, { useState } from 'react';
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
import { useOxy } from '@oxyhq/services';
import { router } from 'expo-router';

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

export default function CreateNoteScreen() {
  const { oxyServices, activeSessionId } = useOxy();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);

  const saveNote = async () => {
    if (!activeSessionId || !oxyServices) {
      Alert.alert('Error', 'Please sign in to save notes');
      return;
    }

    if (!title.trim() && !content.trim()) {
      Alert.alert('Error', 'Please add some content to your note');
      return;
    }

    setIsSaving(true);
    try {
      // Use the correct API call method based on your OxyServices implementation
      const response = await fetch('http://localhost:4000/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeSessionId}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          color: selectedColor,
        }),
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert('Success', 'Note saved successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const cancel = () => {
    if (title.trim() || content.trim()) {
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

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: selectedColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={cancel}>
          <Text style={styles.headerButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Note</Text>
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

      <ScrollView style={styles.content}>
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  saveButton: {
    color: '#1976d2',
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
    paddingHorizontal: 16,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    paddingVertical: 16,
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
});
