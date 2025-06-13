# API Utils

This directory contains utility functions for making authenticated API requests to the Noted backend server.

## Overview

The API utils act as middleware between the React Native frontend and the Express.js backend, handling:
- Authentication token retrieval using OxyServices
- Request/response formatting
- Error handling
- Type safety

## Files

### `api.ts`
Contains all the API functions organized by feature, using OxyServices for authentication:

#### Notes API (`notesApi`)
- `getAllNotes(oxyServices, activeSessionId)` - Get all notes for the authenticated user
- `getNoteById(noteId, oxyServices, activeSessionId)` - Get a specific note by ID
- `createNote(noteData, oxyServices, activeSessionId)` - Create a new note
- `updateNote(noteId, noteData, oxyServices, activeSessionId)` - Update an existing note
- `deleteNote(noteId, oxyServices, activeSessionId)` - Delete a note

#### User API (`userApi`)
- `getUserSessions(oxyServices, activeSessionId)` - Get user session information
- `sendMessage(messageData, oxyServices, activeSessionId)` - Send a message

## Usage

### Basic API Request Flow

```typescript
import { notesApi } from '../utils/api';
import { useOxy } from '@oxyhq/services';

function MyComponent() {
  const { oxyServices, activeSessionId } = useOxy();

  const fetchNotes = async () => {
    try {
      // The API automatically handles:
      // 1. Getting the access token from OxyServices
      // 2. Adding Authorization header
      // 3. Making the request
      // 4. Handling errors
      const result = await notesApi.getAllNotes(oxyServices, activeSessionId);
      console.log(result.notes);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };
}
```

### Authentication Flow

1. **Token Retrieval**: The API middleware calls `oxyServices.getTokenBySession(activeSessionId)` to get the current access token
2. **Request Headers**: Automatically adds `Authorization: Bearer ${accessToken}` header
3. **Error Handling**: If token retrieval fails, throws authentication error

#### Health API (`healthApi`)
- `checkHealth()` - Check server health status (public endpoint)

## Usage Examples

```typescript
import { notesApi, Note } from '../utils/api';

// Get all notes
const notes = await notesApi.getAllNotes(sessionId);

// Create a new note
const newNote = await notesApi.createNote({
  title: 'My Note',
  content: 'Note content',
  color: '#ffffff'
}, sessionId);

// Update a note
await notesApi.updateNote('note-id', {
  title: 'Updated Title'
}, sessionId);

// Delete a note
await notesApi.deleteNote('note-id', sessionId);
```

## Error Handling

All API functions use the `ApiError` class for consistent error handling. Errors include:
- HTTP status codes
- Error messages from the server
- Network-related errors

## Configuration

The API base URL is automatically configured based on the platform:
- Web: `http://localhost:4000`
- Mobile: `http://10.0.2.2:4000` (Android emulator)

## Types

All API functions are fully typed with TypeScript interfaces defined in `types/index.ts`.
