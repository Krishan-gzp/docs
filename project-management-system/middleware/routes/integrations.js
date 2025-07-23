const express = require('express');
const router = express.Router();

// Placeholder for future integrations
router.get('/available', (req, res) => {
  res.json({
    integrations: [
      {
        name: 'Slack',
        status: 'available',
        description: 'Send notifications to Slack channels'
      },
      {
        name: 'Email',
        status: 'available', 
        description: 'Send email notifications'
      },
      {
        name: 'Webhook',
        status: 'available',
        description: 'Send HTTP webhooks on events'
      }
    ]
  });
});

module.exports = router;