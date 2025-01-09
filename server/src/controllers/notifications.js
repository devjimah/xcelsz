const db = require('../models');
const { Notification, Meeting } = db;

exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        error: 'Missing required parameter',
        details: 'userId is required'
      });
    }

    console.log(`Fetching notifications for user ${userId}`);
    const notifications = await Notification.findAll({
      where: { userId },
      include: [{
        model: Meeting,
        as: 'meeting',
        attributes: ['id', 'title', 'startTime', 'duration', 'status'],
        required: false
      }],
      order: [['createdAt', 'DESC']]
    });

    console.log(`Found ${notifications.length} notifications`);
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      error: 'Failed to fetch notifications',
      details: error.message 
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        error: 'Missing required parameter',
        details: 'userId is required'
      });
    }

    console.log(`Marking notification ${id} as read for user ${userId}`);
    const notification = await Notification.findOne({
      where: { 
        id,
        userId // Ensure user can only mark their own notifications
      }
    });
    
    if (!notification) {
      return res.status(404).json({ 
        error: 'Notification not found',
        details: 'The notification does not exist or does not belong to the user'
      });
    }

    await notification.update({ read: true });
    console.log('Notification marked as read');
    
    res.json({ 
      message: 'Notification marked as read',
      notification 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      error: 'Failed to mark notification as read',
      details: error.message
    });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        error: 'Missing required parameter',
        details: 'userId is required'
      });
    }

    console.log(`Marking all notifications as read for user ${userId}`);
    const result = await Notification.update(
      { read: true },
      { 
        where: { 
          userId,
          read: false
        }
      }
    );

    console.log(`Marked ${result[0]} notifications as read`);
    res.json({ 
      message: 'All notifications marked as read',
      count: result[0]
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      error: 'Failed to mark notifications as read',
      details: error.message
    });
  }
};
