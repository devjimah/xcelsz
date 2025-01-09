const express = require('express');
const router = express.Router();
const meetingsController = require('../controllers/meetings');

// GET /api/meetings
router.get('/', meetingsController.getMeetings);

// GET /api/meetings/:id
router.get('/:id', meetingsController.getMeeting);

// POST /api/meetings
router.post('/', meetingsController.createMeeting);

// PUT /api/meetings/:id
router.put('/:id', meetingsController.updateMeeting);

// DELETE /api/meetings/:id
router.delete('/:id', meetingsController.deleteMeeting);

module.exports = router;
