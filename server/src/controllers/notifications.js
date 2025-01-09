const db = require('../models');
const { Notification } = db;

exports.getNotifications = async (req, res) => {
  try {
    const { userId } = req.query;
    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);
    
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await notification.update({ read: true });
    res.json({ notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
};
