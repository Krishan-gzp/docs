const express = require('express');
const router = express.Router();

// In-memory storage for demo (use Redis in production)
const notifications = [];

// Get notifications for a user
router.get('/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const userNotifications = notifications.filter(n => n.userId === userId);
  res.json(userNotifications);
});

// Create a notification
router.post('/', (req, res) => {
  const notification = {
    id: Date.now(),
    userId: req.body.userId,
    title: req.body.title,
    message: req.body.message,
    type: req.body.type || 'info',
    read: false,
    createdAt: new Date().toISOString()
  };
  
  notifications.push(notification);
  
  // Emit to specific user via Socket.IO
  const io = req.app.get('io');
  if (io) {
    io.to(`user-${notification.userId}`).emit('notification', notification);
  }
  
  res.status(201).json(notification);
});

// Mark notification as read
router.put('/:id/read', (req, res) => {
  const id = parseInt(req.params.id);
  const notification = notifications.find(n => n.id === id);
  
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  
  notification.read = true;
  res.json(notification);
});

// Delete notification
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = notifications.findIndex(n => n.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  
  notifications.splice(index, 1);
  res.json({ message: 'Notification deleted' });
});

module.exports = router;