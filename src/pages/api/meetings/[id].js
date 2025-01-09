import db from '../../../models';

const { Meeting, Notification } = db;

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Meeting ID is required' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const meeting = await Meeting.findByPk(id);
        if (!meeting) {
          return res.status(404).json({ error: 'Meeting not found' });
        }
        return res.status(200).json({ meeting });
      } catch (error) {
        console.error('Error fetching meeting:', error);
        return res.status(500).json({ error: 'Failed to fetch meeting' });
      }

    case 'PUT':
      try {
        const meeting = await Meeting.findByPk(id);
        if (!meeting) {
          return res.status(404).json({ error: 'Meeting not found' });
        }

        const changes = req.body;
        await meeting.update(changes);

        // Create notification for meeting update
        try {
          await Notification.create({
            userId: meeting.participantId,
            type: 'MEETING_UPDATED',
            title: 'Meeting Updated',
            message: `The meeting "${meeting.title}" has been updated`,
            relatedId: meeting.id,
            read: false
          });
        } catch (notifError) {
          console.error('Failed to create update notification:', notifError);
        }
        
        return res.status(200).json({ meeting });
      } catch (error) {
        console.error('Error updating meeting:', error);
        return res.status(500).json({ error: 'Failed to update meeting' });
      }

    case 'DELETE':
      try {
        const meeting = await Meeting.findByPk(id);
        if (!meeting) {
          return res.status(404).json({ error: 'Meeting not found' });
        }

        // Create notification for meeting cancellation
        try {
          await Notification.create({
            userId: meeting.participantId,
            type: 'MEETING_CANCELLED',
            title: 'Meeting Cancelled',
            message: `The meeting "${meeting.title}" has been cancelled`,
            relatedId: meeting.id,
            read: false
          });
        } catch (notifError) {
          console.error('Failed to create cancellation notification:', notifError);
        }

        await meeting.destroy();
        return res.status(204).end();
      } catch (error) {
        console.error('Error deleting meeting:', error);
        return res.status(500).json({ error: 'Failed to delete meeting' });
      }

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
