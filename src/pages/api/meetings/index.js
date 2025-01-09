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
            ],
            status: {
              [Op.not]: 'cancelled'
            }
          },
          order: [['startTime', 'ASC']]
        });

        return res.status(200).json({ meetings });
      } catch (error) {
        console.error('Error fetching meetings:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      break;

    case 'POST':
      try {
        const { title, description, startTime, duration, hostId, participantId, timezone } = req.body;

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
            status: 'scheduled'
          }
        });

        if (conflictingMeeting) {
          return res.status(409).json({ error: 'Time slot conflicts with existing meeting' });
        }

        // Create meeting
        const meeting = await Meeting.create({
          title,
          description: description || '',
          startTime: new Date(startTime),
          duration,
          hostId,
          participantId,
          timezone,
          status: 'scheduled'
        });

        // Create notification for participant
        try {
          await db.Notification.create({
            userId: participantId,
            type: 'MEETING_INVITATION',
            title: 'New Meeting Invitation',
            message: `You have been invited to a meeting: ${title}`,
            relatedId: meeting.id,
            read: false
          });
        } catch (notifError) {
          console.error('Failed to create notification:', notifError);
        }

        return res.status(201).json({ meeting });
      } catch (error) {
        console.error('Error creating meeting:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
