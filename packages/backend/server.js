const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OxyServices } = require('@oxyhq/services/core');

// Initialize OxyServices with your Oxy API URL
const oxyServices = new OxyServices({
  baseURL: 'http://localhost:3001', // Replace with your Oxy API URL
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

app.listen(4000, () => {
  console.log('🚀 Oxy Backend running on port 4000');
  console.log('Features: JWT Authentication with OxyServices');
  console.log('Available endpoints:');
  console.log('  GET  /api/health - Health check (public)');
  console.log('  POST /api/messages - Send message (authenticated)');
  console.log('  GET  /api/user/sessions - Get user info (authenticated)');
});