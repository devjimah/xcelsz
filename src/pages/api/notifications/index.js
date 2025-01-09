import db from '../../../models';

const { Notification } = db;

export default async function handler(req, res) {
  // Ensure database is initialized
  if (!db.sequelize) {
    console.error('Database not initialized');
    return res.status(500).json({ error: 'Database connection error' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const { userId } = req.query;
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
        }

        const notifications = await Notification.findAll({
          where: {
            userId,
            read: false
          },
          order: [['createdAt', 'DESC']]
        });

        return res.status(200).json(notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({ error: 'Failed to fetch notifications' });
      }
      break;

    case 'POST':
      try {
        const { userId, type, title, message, relatedId } = req.body;
        
        if (!userId || !type || !title || !message) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const notification = await Notification.create({
          userId,
          type,
          title,
          message,
          relatedId
        });

        return res.status(201).json(notification);
      } catch (error) {
        console.error('Error creating notification:', error);
        return res.status(500).json({ error: 'Failed to create notification' });
      }
      break;

    case 'PUT':
      try {
        const { notificationId, userId } = req.body;
        
        if (!notificationId || !userId) {
          return res.status(400).json({ error: 'Notification ID and User ID are required' });
        }

        const result = await Notification.update(
          { read: true },
          {
            where: {
              id: notificationId,
              userId
            }
          }
        );

        if (result[0] === 0) {
          return res.status(404).json({ error: 'Notification not found' });
        }

        return res.status(200).json({ message: 'Notification marked as read' });
      } catch (error) {
        console.error('Error updating notification:', error);
        return res.status(500).json({ error: 'Failed to update notification' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
