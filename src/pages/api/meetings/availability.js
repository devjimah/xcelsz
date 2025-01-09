import { Op } from 'sequelize';
import db from '../../../models';

const { Meeting } = db;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, date, timezone } = req.query;

    if (!userId || !date || !timezone) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Convert date string to Date object in the specified timezone
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Find all meetings for the user on the specified date
    const meetings = await Meeting.findAll({
      where: {
        [Op.or]: [
          { hostId: userId },
          { participantId: userId }
        ],
        startTime: {
          [Op.between]: [startDate, endDate]
        },
        status: 'scheduled'
      },
      order: [['startTime', 'ASC']]
    });

    // Define working hours and slot configuration
    const workingHourStart = 9; // 9 AM
    const workingHourEnd = 17; // 5 PM
    const slotDuration = 30; // 30 minutes
    const minMeetingDuration = 30; // Minimum meeting duration in minutes

    const availableSlots = [];
    const busySlots = meetings.map(meeting => ({
      start: new Date(meeting.startTime),
      end: new Date(new Date(meeting.startTime).getTime() + meeting.duration * 60000)
    }));

    // Generate time slots
    for (let hour = workingHourStart; hour < workingHourEnd; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        
        // Check if slot is in the past
        if (slotStart < new Date()) {
          continue;
        }

        // Calculate potential meeting end time (using minimum duration)
        const slotEnd = new Date(slotStart.getTime() + minMeetingDuration * 60000);

        // Check if slot conflicts with any existing meeting
        const isConflicting = busySlots.some(busy => {
          // Check if slot overlaps with busy period
          return (slotStart < busy.end && slotEnd > busy.start);
        });

        if (!isConflicting) {
          availableSlots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString()
          });
        }
      }
    }

    return res.status(200).json({
      date,
      timezone,
      availableSlots,
      workingHours: {
        start: workingHourStart,
        end: workingHourEnd
      }
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return res.status(500).json({ error: 'Failed to check availability' });
  }
}
