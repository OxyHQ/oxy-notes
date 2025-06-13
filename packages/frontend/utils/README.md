# API Utils

This directory contains utility functions for making API requests in the Noted application.

## Files

### `api.ts`
Contains all the API functions organized by feature:

#### Notes API (`notesApi`)
- `getAllNotes(sessionId)` - Get all notes for the authenticated user
- `getNoteById(noteId, sessionId)` - Get a specific note by ID
- `createNote(noteData, sessionId)` - Create a new note
- `updateNote(noteId, noteData, sessionId)` - Update an existing note
- `deleteNote(noteId, sessionId)` - Delete a note

#### User API (`userApi`)
- `getUserSessions(sessionId)` - Get user session information
- `sendMessage(messageData, sessionId)` - Send a message (example endpoint)

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
