const db = require('../models');
const { Meeting, Notification } = db;
const { Op } = db.Sequelize;
const { startOfDay, endOfDay, addMinutes, format, parseISO, setHours, setMinutes } = require('date-fns');

// Generate time slots for a given date
const generateTimeSlots = (baseDate, duration = 30) => {
  console.log('Generating slots for base date:', baseDate, 'with duration:', duration);
  const slots = [];
  
  // Create a new date object and set to 9 AM
  const startTime = new Date(baseDate);
  startTime.setHours(9, 0, 0, 0);
  
  // Create end time at 5 PM
  const endTime = new Date(baseDate);
  endTime.setHours(17, 0, 0, 0);
  
  console.log('Start time:', startTime.toISOString());
  console.log('End time:', endTime.toISOString());

  let currentTime = startTime;
  while (currentTime < endTime) {
    const slotEndTime = new Date(currentTime.getTime() + duration * 60000);
    // Only add the slot if it ends before or at the end time
    if (slotEndTime <= endTime) {
      slots.push({
        startTime: currentTime.toISOString(),
        endTime: slotEndTime.toISOString(),
        duration
      });
    }
    currentTime = new Date(currentTime.getTime() + duration * 60000);
  }

  console.log('Generated slots:', slots);
  return slots;
};

exports.getAvailability = async (req, res) => {
  try {
    const { userId, date, timezone, duration = 30 } = req.query;
    console.log('Received request:', { userId, date, timezone, duration });

    if (!userId || !date || !timezone) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['userId', 'date', 'timezone'],
        received: { userId, date, timezone }
      });
    }

    // Parse the date
    const requestDate = parseISO(date);
    console.log('Parsed request date:', requestDate);
    
    // Get all slots for the day with the requested duration
    const allSlots = generateTimeSlots(requestDate, parseInt(duration));

    // Get booked meetings for the date
    const bookedMeetings = await Meeting.findAll({
      where: {
        [Op.or]: [
          { hostId: userId },
          { participantId: userId }
        ],
        startTime: {
          [Op.between]: [
            startOfDay(requestDate),
            endOfDay(requestDate)
          ]
        }
      }
    });

    console.log('Found booked meetings:', bookedMeetings);

    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);
      return !bookedMeetings.some(meeting => {
        const meetingStart = new Date(meeting.startTime);
        const meetingEnd = new Date(meetingStart.getTime() + meeting.duration * 60000);
        // Check if there's any overlap between the slot and the meeting
        return (slotStart < meetingEnd && slotEnd > meetingStart);
      });
    });

    const response = { 
      availableSlots,
      timezone,
      date: format(requestDate, 'yyyy-MM-dd')
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error getting availability:', error);
    res.status(500).json({ 
      error: 'Failed to get availability',
      details: error.message,
      stack: error.stack
    });
  }
};

exports.createMeeting = async (req, res) => {
  try {
    const { hostId, participantId, startTime, duration, title, description, timezone } = req.body;
    console.log('Creating meeting:', { hostId, participantId, startTime, duration, title, timezone });

    if (!hostId || !participantId || !startTime || !duration || !title) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['hostId', 'participantId', 'startTime', 'duration', 'title'],
        received: { hostId, participantId, startTime, duration, title }
      });
    }

    // Parse the start time
    const meetingStartTime = new Date(startTime);
    
    // Create the meeting
    const meeting = await Meeting.create({
      hostId,
      participantId,
      startTime: meetingStartTime,
      duration: parseInt(duration),
      title,
      description: description || '',
      status: 'scheduled',
      timezone: timezone || 'UTC'
    });

    console.log('Created meeting:', meeting.toJSON());

    // Create notification for participant
    await Notification.create({
      userId: participantId,
      type: 'MEETING_INVITATION',
      message: `You have been invited to a meeting: ${title}`,
      relatedId: meeting.id,
      read: false
    });

    res.status(201).json({ meeting });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ 
      error: 'Failed to create meeting',
      details: error.message,
      stack: error.stack
    });
  }
};

exports.getMeetings = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const meetings = await Meeting.findAll({
      where: {
        [Op.or]: [
          { hostId: userId },
          { participantId: userId }
        ]
      },
      order: [['startTime', 'ASC']]
    });

    console.log(`Found ${meetings.length} meetings for user ${userId}`);
    res.json({ meetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ 
      error: 'Failed to fetch meetings',
      details: error.message,
      stack: error.stack
    });
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
    res.status(500).json({ 
      error: 'Failed to fetch meeting',
      details: error.message,
      stack: error.stack
    });
  }
};

exports.updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, duration, title, description, status } = req.body;
    
    const meeting = await Meeting.findByPk(id);
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    await meeting.update({
      startTime: startTime || meeting.startTime,
      duration: duration || meeting.duration,
      title: title || meeting.title,
      description: description || meeting.description,
      status: status || meeting.status
    });

    res.json({ meeting });
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ 
      error: 'Failed to update meeting',
      details: error.message,
      stack: error.stack
    });
  }
};

exports.deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findByPk(id);
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    await meeting.update({ status: 'cancelled' });
    
    // Notify participants
    await Notification.create({
      userId: meeting.participantId,
      type: 'MEETING_CANCELLED',
      message: `Meeting "${meeting.title}" has been cancelled`,
      relatedId: meeting.id,
      read: false
    });

    res.json({ message: 'Meeting cancelled successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ 
      error: 'Failed to delete meeting',
      details: error.message,
      stack: error.stack
    });
  }
};
