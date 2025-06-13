// Common types for the Noted application

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  color?: string;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  color?: string;
}

export interface User {
  id: string;
  username?: string;
  email?: string;
  name?: string;
  avatar?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface NotesResponse extends ApiResponse {
  notes: Note[];
  count: number;
}

export interface NoteResponse extends ApiResponse {
  note: Note;
}

export interface UserResponse extends ApiResponse {
  user: User;
}

// Common color palette for notes (inspired by Google Keep)
export const NOTE_COLORS = [
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
] as const;

export type NoteColor = typeof NOTE_COLORS[number];

// View modes for notes display
export type ViewMode = 'grid' | 'list';

// Theme types
export type Theme = 'light' | 'dark';

// Navigation types
export interface NavigationParams {
  noteId?: string;
  mode?: 'create' | 'edit';
}
