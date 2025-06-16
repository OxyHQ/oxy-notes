const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OxyServices } = require('@oxyhq/services/core');

// Initialize OxyServices with your Oxy API URL
const isProduction = process.env.NODE_ENV === 'production';
const oxyServices = new OxyServices({
  baseURL: isProduction
    ? process.env.OXY_API_URL || 'https://api.oxy.so' // Use your prod API URL
    : 'http://localhost:3001/', // Dev API URL
});

// Express setup
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create authentication middleware
const authenticateToken = oxyServices.createAuthenticateTokenMiddleware({  
  loadFullUser: true,  
  onError: (error) => {  
    console.error('Auth error:', error);  
  }  
});  

// Health check endpoint (unauthenticated)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    features: ['device-based-auth', 'session-isolation', 'multi-user-support']
  });
});

// Apply authentication middleware to all other API routes
app.use('/api', authenticateToken);

// Messages endpoint (authenticated)
app.post('/api/messages', async (req, res) => {  
  try {  
    const { title, content } = req.body;
      
    res.json({   
      success: true,
      userId: req.userId,
      user: {
        id: req.user.id || req.user._id,
        username: req.user.username,
        email: req.user.email
      },
      message: 'Message sent successfully',
      data: { title, content },
      timestamp: new Date().toISOString()
    });  
  } catch (error) {  
    res.status(500).json({ error: error.message });  
  }  
});

// Device sessions endpoint (authenticated)
app.get('/api/user/sessions', async (req, res) => {
  try {
    res.json({
      currentUser: {
        id: req.user.id || req.user._id,
        username: req.user.username,
        email: req.user.email
      },
      userId: req.userId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to get user sessions', 
      details: error.message 
    });
  }
});

// In-memory storage for notes (in production, use a real database)
let notes = [];
let noteIdCounter = 1;

// Notes endpoints (authenticated)

// Get all notes for the authenticated user
app.get('/api/notes', async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userNotes = notes.filter(note => note.userId === userId);
    
    res.json({
      success: true,
      notes: userNotes,
      count: userNotes.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch notes', 
      details: error.message 
    });
  }
});

// Get a specific note by ID
app.get('/api/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id || req.user._id;
    
    const note = notes.find(n => n.id === noteId && n.userId === userId);
    
    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }
    
    res.json({
      success: true,
      note: note
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch note', 
      details: error.message 
    });
  }
});

// Create a new note
app.post('/api/notes', async (req, res) => {
  try {
    const { title, content, color = '#ffffff' } = req.body;
    const userId = req.user.id || req.user._id;
    
    if (!title && !content) {
      return res.status(400).json({
        success: false,
        error: 'Note must have either a title or content'
      });
    }
    
    const newNote = {
      id: String(noteIdCounter++),
      title: title || '',
      content: content || '',
      color: color,
      archived: false,
      userId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    notes.push(newNote);
    
    res.json({
      success: true,
      note: newNote,
      message: 'Note created successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to create note', 
      details: error.message 
    });
  }
});

// Update an existing note
app.put('/api/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const { title, content, color } = req.body;
    const userId = req.user.id || req.user._id;
    
    const noteIndex = notes.findIndex(n => n.id === noteId && n.userId === userId);
    
    if (noteIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }
    
    // Update the note
    const updatedNote = {
      ...notes[noteIndex],
      title: title !== undefined ? title : notes[noteIndex].title,
      content: content !== undefined ? content : notes[noteIndex].content,
      color: color !== undefined ? color : notes[noteIndex].color,
      updatedAt: new Date().toISOString()
    };
    
    notes[noteIndex] = updatedNote;
    
    res.json({
      success: true,
      note: updatedNote,
      message: 'Note updated successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to update note', 
      details: error.message 
    });
  }
});

// Delete a note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id || req.user._id;
    
    const noteIndex = notes.findIndex(n => n.id === noteId && n.userId === userId);
    
    if (noteIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }
    
    // Remove the note
    const deletedNote = notes.splice(noteIndex, 1)[0];
    
    res.json({
      success: true,
      note: deletedNote,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete note', 
      details: error.message 
    });
  }
});

// Archive a note
app.patch('/api/notes/:id/archive', async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id || req.user._id;
    
    const noteIndex = notes.findIndex(n => n.id === noteId && n.userId === userId);
    
    if (noteIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }
    
    // Archive the note
    notes[noteIndex] = {
      ...notes[noteIndex],
      archived: true,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      note: notes[noteIndex],
      message: 'Note archived successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to archive note', 
      details: error.message 
    });
  }
});

// Unarchive a note
app.patch('/api/notes/:id/unarchive', async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.id || req.user._id;
    
    const noteIndex = notes.findIndex(n => n.id === noteId && n.userId === userId);
    
    if (noteIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Note not found'
      });
    }
    
    // Unarchive the note
    notes[noteIndex] = {
      ...notes[noteIndex],
      archived: false,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      note: notes[noteIndex],
      message: 'Note unarchived successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: 'Failed to unarchive note', 
      details: error.message 
    });
  }
});

app.listen(4000, () => {
  console.log('🚀 Oxy Backend running on port 4000');
  console.log('Features: JWT Authentication with OxyServices');
  console.log('Available endpoints:');
  console.log('  GET  /api/health - Health check (public)');
  console.log('  POST /api/messages - Send message (authenticated)');
  console.log('  GET  /api/user/sessions - Get user info (authenticated)');
  console.log('  GET  /api/notes - Get all notes (authenticated)');
  console.log('  GET  /api/notes/:id - Get note by ID (authenticated)');
  console.log('  POST /api/notes - Create note (authenticated)');
  console.log('  PUT  /api/notes/:id - Update note (authenticated)');
  console.log('  DELETE /api/notes/:id - Delete note (authenticated)');
  console.log('  PATCH /api/notes/:id/archive - Archive note (authenticated)');
  console.log('  PATCH /api/notes/:id/unarchive - Unarchive note (authenticated)');
});