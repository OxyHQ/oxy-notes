import { Platform } from 'react-native';
import { OxyServices } from '@oxyhq/services';

// API Configuration
const API_CONFIG = {
  baseURL: Platform.OS === 'web' ? 'http://localhost:4000' : 'http://10.0.2.2:4000',
  endpoints: {
    notes: '/api/notes',
    health: '/api/health',
    userSessions: '/api/user/sessions',
    messages: '/api/messages',
  },
};

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  archived: boolean;
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

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Base API request function with OxyServices token management
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  oxyServices?: OxyServices,
  activeSessionId?: string
): Promise<T> {
  const url = `${API_CONFIG.baseURL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Use OxyServices to get the proper token
  if (oxyServices && activeSessionId) {
    try {
      const tokenData = await oxyServices.getTokenBySession(activeSessionId);
      
      if (!tokenData) {
        throw new ApiError('No authentication token found', 401);
      }
      
      headers['Authorization'] = `Bearer ${tokenData.accessToken}`;
    } catch (error) {
      console.error('Failed to get token:', error);
      throw new ApiError('Authentication failed', 401);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || data.error || `HTTP ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error('API Request failed:', error);
    throw new ApiError(
      error instanceof Error ? error.message : 'Network request failed'
    );
  }
}

// Notes API functions
export const notesApi = {
  // Get all notes for the authenticated user
  async getAllNotes(oxyServices: OxyServices, activeSessionId: string): Promise<NotesResponse> {
    return apiRequest<NotesResponse>(API_CONFIG.endpoints.notes, {
      method: 'GET',
    }, oxyServices, activeSessionId);
  },

  // Get a specific note by ID
  async getNoteById(noteId: string, oxyServices: OxyServices, activeSessionId: string): Promise<NoteResponse> {
    return apiRequest<NoteResponse>(`${API_CONFIG.endpoints.notes}/${noteId}`, {
      method: 'GET',
    }, oxyServices, activeSessionId);
  },

  // Create a new note
  async createNote(noteData: CreateNoteData, oxyServices: OxyServices, activeSessionId: string): Promise<NoteResponse> {
    return apiRequest<NoteResponse>(API_CONFIG.endpoints.notes, {
      method: 'POST',
      body: JSON.stringify({
        title: noteData.title.trim(),
        content: noteData.content.trim(),
        color: noteData.color || '#ffffff',
      }),
    }, oxyServices, activeSessionId);
  },

  // Update an existing note
  async updateNote(noteId: string, noteData: UpdateNoteData, oxyServices: OxyServices, activeSessionId: string): Promise<NoteResponse> {
    return apiRequest<NoteResponse>(`${API_CONFIG.endpoints.notes}/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    }, oxyServices, activeSessionId);
  },

  // Delete a note
  async deleteNote(noteId: string, oxyServices: OxyServices, activeSessionId: string): Promise<ApiResponse> {
    return apiRequest<ApiResponse>(`${API_CONFIG.endpoints.notes}/${noteId}`, {
      method: 'DELETE',
    }, oxyServices, activeSessionId);
  },

  // Archive a note
  async archiveNote(noteId: string, oxyServices: OxyServices, activeSessionId: string): Promise<NoteResponse> {
    return apiRequest<NoteResponse>(`${API_CONFIG.endpoints.notes}/${noteId}/archive`, {
      method: 'PATCH',
    }, oxyServices, activeSessionId);
  },

  // Unarchive a note
  async unarchiveNote(noteId: string, oxyServices: OxyServices, activeSessionId: string): Promise<NoteResponse> {
    return apiRequest<NoteResponse>(`${API_CONFIG.endpoints.notes}/${noteId}/unarchive`, {
      method: 'PATCH',
    }, oxyServices, activeSessionId);
  },
};

// User API functions
export const userApi = {
  // Get user sessions
  async getUserSessions(oxyServices: OxyServices, activeSessionId: string): Promise<ApiResponse> {
    return apiRequest<ApiResponse>(API_CONFIG.endpoints.userSessions, {
      method: 'GET',
    }, oxyServices, activeSessionId);
  },

  // Send a message (example endpoint from the backend)
  async sendMessage(messageData: { title: string; content: string }, oxyServices: OxyServices, activeSessionId: string): Promise<ApiResponse> {
    return apiRequest<ApiResponse>(API_CONFIG.endpoints.messages, {
      method: 'POST',
      body: JSON.stringify(messageData),
    }, oxyServices, activeSessionId);
  },
};

// Health check API
export const healthApi = {
  // Check server health (public endpoint)
  async checkHealth(): Promise<ApiResponse> {
    return apiRequest<ApiResponse>(API_CONFIG.endpoints.health, {
      method: 'GET',
    });
  },
};

// Export the API configuration for external use
export { API_CONFIG, ApiError };

// Default export with all APIs
export default {
  notes: notesApi,
  user: userApi,
  health: healthApi,
  config: API_CONFIG,
};
