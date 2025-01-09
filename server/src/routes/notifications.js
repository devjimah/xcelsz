const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications');

// GET /api/notifications
router.get('/', notificationsController.getNotifications);

// PUT /api/notifications/:id/read
router.put('/:id/read', notificationsController.markAsRead);

// PUT /api/notifications/read-all
router.put('/read-all', notificationsController.markAllAsRead);

module.exports = router;
