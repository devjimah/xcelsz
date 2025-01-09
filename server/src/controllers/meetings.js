const db = require('../models');
const { Meeting, Notification } = db;
const { Op } = db.Sequelize;
const { startOfDay, endOfDay, addMinutes, format, parseISO } = require('date-fns');
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');

// Generate time slots for a given date
const generateTimeSlots = (date, timezone) => {
  const slots = [];
  let currentTime = new Date(date);
  currentTime.setHours(9, 0, 0, 0); // Start at 9 AM

  while (currentTime.getHours() < 17) { // Until 5 PM
    slots.push(format(currentTime, 'HH:mm'));
    currentTime = addMinutes(currentTime, 30); // 30-minute slots
  }
  return slots;
};

exports.getAvailability = async (req, res) => {
  try {
    const { userId, date, timezone } = req.query;
    if (!userId || !date || !timezone) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['userId', 'date', 'timezone'],
        received: { userId, date, timezone }
      });
    }

    // Parse the date and set to local timezone
    const requestDate = parseISO(date);
    const zonedDate = utcToZonedTime(requestDate, timezone);
    
    // Get all slots for the day
    const allSlots = generateTimeSlots(zonedDate, timezone);

    // Get booked meetings for the date
    const bookedMeetings = await Meeting.findAll({
      where: {
        [Op.or]: [
          { hostId: userId },
          { participantId: userId }
        ],
        startTime: {
          [Op.between]: [
            startOfDay(zonedDate),
            endOfDay(zonedDate)
          ]
        }
      }
    });

    // Convert booked times to simple time format (HH:mm)
    const bookedTimes = bookedMeetings.map(meeting => 
      format(new Date(meeting.startTime), 'HH:mm')
    );

    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

    res.json({ 
      availableSlots,
      timezone,
      date: format(zonedDate, 'yyyy-MM-dd')
    });

  } catch (error) {
    console.error('Error getting availability:', error);
    res.status(500).json({ 
      error: 'Failed to get availability',
      details: error.message 
    });
  }
};

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
