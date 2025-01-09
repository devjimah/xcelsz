const db = require('../models');
const { Meeting, Notification } = db;
const { Op } = db.Sequelize;
const { startOfDay, endOfDay, addMinutes, format, parseISO, setHours, setMinutes } = require('date-fns');
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');

// Generate time slots for a given date
const generateTimeSlots = (date) => {
  const slots = [];
  let currentTime = new Date(date);
  currentTime = setHours(currentTime, 9);
  currentTime = setMinutes(currentTime, 0);

  const endTime = setHours(new Date(date), 17);

  while (currentTime < endTime) {
    slots.push({
      startTime: currentTime.toISOString(),
      endTime: addMinutes(currentTime, 30).toISOString()
    });
    currentTime = addMinutes(currentTime, 30);
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
    const allSlots = generateTimeSlots(zonedDate);

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

    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => {
      const slotStart = new Date(slot.startTime);
      return !bookedMeetings.some(meeting => {
        const meetingStart = new Date(meeting.startTime);
        const meetingEnd = addMinutes(meetingStart, meeting.duration || 30);
        return slotStart >= meetingStart && slotStart < meetingEnd;
      });
    });

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
    const { hostId, participantId, startTime, duration, title, description } = req.body;
    const meeting = await Meeting.create({
      hostId,
      participantId,
      startTime,
      duration,
      title,
      description
    });

    // Create notification for participant
    await Notification.create({
      userId: participantId,
      type: 'MEETING_INVITATION',
      message: `You have been invited to a meeting: ${title}`,
      meetingId: meeting.id
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

    // Create notification for status updates
    if (status) {
      await Notification.create({
        userId: meeting.participantId,
        type: 'MEETING_UPDATE',
        message: `Meeting "${meeting.title}" has been ${status.toLowerCase()}`,
        meetingId: meeting.id
      });
    }

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
      message: `Meeting "${meeting.title}" has been cancelled`,
      meetingId: meeting.id
    });

    await meeting.destroy();
    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({ error: 'Failed to delete meeting' });
  }
};
