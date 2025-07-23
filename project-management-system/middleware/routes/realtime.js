const express = require('express');
const router = express.Router();

// Get connected users count
router.get('/status', (req, res) => {
  const io = req.app.get('io');
  const connectedUsers = io ? io.engine.clientsCount : 0;
  
  res.json({
    connected_users: connectedUsers,
    server_time: new Date().toISOString()
  });
});

// Broadcast message to all users in a project
router.post('/broadcast/:projectId', (req, res) => {
  const projectId = req.params.projectId;
  const { message, type, data } = req.body;
  
  const io = req.app.get('io');
  if (io) {
    io.to(`project-${projectId}`).emit('broadcast', {
      message,
      type,
      data,
      timestamp: new Date().toISOString()
    });
    
    res.json({ message: 'Broadcast sent successfully' });
  } else {
    res.status(500).json({ error: 'Socket.IO not available' });
  }
});

// Send message to specific user
router.post('/message/:userId', (req, res) => {
  const userId = req.params.userId;
  const { message, type, data } = req.body;
  
  const io = req.app.get('io');
  if (io) {
    io.to(`user-${userId}`).emit('message', {
      message,
      type,
      data,
      timestamp: new Date().toISOString()
    });
    
    res.json({ message: 'Message sent successfully' });
  } else {
    res.status(500).json({ error: 'Socket.IO not available' });
  }
});

// Get active rooms
router.get('/rooms', (req, res) => {
  const io = req.app.get('io');
  if (io) {
    const rooms = Array.from(io.sockets.adapter.rooms.keys())
      .filter(room => room.startsWith('project-') || room.startsWith('user-'));
    
    res.json({ rooms });
  } else {
    res.status(500).json({ error: 'Socket.IO not available' });
  }
});

module.exports = router;