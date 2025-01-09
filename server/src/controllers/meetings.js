const db = require('../models');
const { Meeting, Notification } = db;

exports.getMeetings = async (req, res) => {
  try {
    const { userId } = req.query;
    const meetings = await Meeting.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { hostId: userId },
          { participantId: userId }
        ]
      },
      order: [['startTime', 'ASC']]
    });
    res.json({ meetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: 'Failed to fetch meetings' });
  }
};

exports.getMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json({ meeting });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ error: 'Failed to fetch meeting' });
  }
};

exports.createMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.create(req.body);
    
    // Create notification for participant
    await Notification.create({
      userId: meeting.participantId,
      type: 'MEETING_CREATED',
      title: 'New Meeting Invitation',
      message: `You have been invited to "${meeting.title}"`,
      relatedId: meeting.id,
      read: false
    });

    res.status(201).json({ meeting });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: 'Failed to create meeting' });
  }
};

exports.updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findByPk(id);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    await meeting.update(req.body);

    // Create notification for update
    await Notification.create({
      userId: meeting.participantId,
      type: 'MEETING_UPDATED',
      title: 'Meeting Updated',
      message: `The meeting "${meeting.title}" has been updated`,
      relatedId: meeting.id,
      read: false
    });

    res.json({ meeting });
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ error: 'Failed to update meeting' });
  }
};

exports.deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findByPk(id);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Create notification for cancellation
    await Notification.create({
      userId: meeting.participantId,
      type: 'MEETING_CANCELLED',
      title: 'Meeting Cancelled',
      message: `The meeting "${meeting.title}" has been cancelled`,
      relatedId: meeting.id,
      read: false
    });

    await meeting.destroy();
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ error: 'Failed to delete meeting' });
  }
};
