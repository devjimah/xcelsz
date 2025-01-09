import db from '../../../models';
import { Op } from 'sequelize';

const { Meeting } = db;

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
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
        return res.status(200).json({ meetings });
      } catch (error) {
        console.error('Error fetching meetings:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    case 'POST':
      try {
        const { title, description, startTime, duration, hostId, participantId, timezone } = req.body;
        console.log('Creating meeting with:', { title, startTime, duration, hostId, participantId });

        // Validate required fields
        if (!title || !startTime || !duration || !hostId || !participantId || !timezone) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check for scheduling conflicts
        const conflictingMeeting = await Meeting.findOne({
          where: {
            [Op.or]: [
              { hostId },
              { participantId }
            ],
            startTime: {
              [Op.between]: [
                new Date(startTime),
                new Date(new Date(startTime).getTime() + duration * 60000)
              ]
            },
            status: {
              [Op.not]: 'cancelled'
            }
          }
        });

        if (conflictingMeeting) {
          return res.status(409).json({ error: 'Time slot is no longer available' });
        }

        // Create the meeting
        const meeting = await Meeting.create({
          title,
          description,
          startTime,
          duration: parseInt(duration),
          hostId,
          participantId,
          timezone,
          status: 'scheduled'
        });

        console.log('Created meeting:', meeting.toJSON());
        return res.status(201).json({ meeting });
      } catch (error) {
        console.error('Error creating meeting:', error);
        return res.status(500).json({ error: 'Failed to create meeting' });
      }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
