const db = require('../models');
const { Notification, Meeting } = db;

exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [{
        model: Meeting,
        as: 'meeting',
        required: false,
        where: {
          relatedId: db.sequelize.col('Notification.relatedId')
        }
      }]
    });

    console.log(`Found ${notifications.length} notifications for user ${userId}`);
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      error: 'Failed to fetch notifications',
      details: error.message,
      stack: error.stack
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const notification = await Notification.findOne({
      where: { 
        id,
        userId // Ensure user can only mark their own notifications as read
      }
    });
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.update({ read: true });
    console.log(`Marked notification ${id} as read for user ${userId}`);
    res.json({ notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      error: 'Failed to update notification',
      details: error.message,
      stack: error.stack
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    await Notification.update(
      { read: true },
      { where: { userId, read: false } }
    );

    console.log(`Marked all notifications as read for user ${userId}`);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      error: 'Failed to update notifications',
      details: error.message,
      stack: error.stack
    });
  }
};
