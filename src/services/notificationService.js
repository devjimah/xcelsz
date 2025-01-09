import db from '../models';

const { Notification } = db;

class NotificationService {
  static async createNotification(userId, type, title, message, relatedId = null) {
    return await Notification.create({
      userId,
      type,
      title,
      message,
      relatedId
    });
  }

  static async getUnreadNotifications(userId) {
    return await Notification.findAll({
      where: {
        userId,
        read: false
      },
      order: [['createdAt', 'DESC']]
    });
  }

  static async markAsRead(notificationId, userId) {
    return await Notification.update(
      { read: true },
      {
        where: {
          id: notificationId,
          userId
        }
      }
    );
  }

  static async markAllAsRead(userId) {
    return await Notification.update(
      { read: true },
      {
        where: {
          userId,
          read: false
        }
      }
    );
  }

  // Meeting-specific notification methods
  static async notifyMeetingCreated(meeting) {
    const { hostId, participantId, title, startTime } = meeting;
    const formattedTime = new Date(startTime).toLocaleString();

    // Notify participant
    await this.createNotification(
      participantId,
      'MEETING_INVITATION',
      'New Meeting Invitation',
      `You have been invited to "${title}" scheduled for ${formattedTime}`,
      meeting.id
    );

    // Notify host
    await this.createNotification(
      hostId,
      'MEETING_CREATED',
      'Meeting Scheduled',
      `Your meeting "${title}" has been scheduled for ${formattedTime}`,
      meeting.id
    );
  }

  static async notifyMeetingUpdated(meeting, changes) {
    const { hostId, participantId, title } = meeting;
    const changeDescription = Object.entries(changes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    // Notify participant
    await this.createNotification(
      participantId,
      'MEETING_UPDATED',
      'Meeting Updated',
      `The meeting "${title}" has been updated. Changes: ${changeDescription}`,
      meeting.id
    );

    // Notify host
    await this.createNotification(
      hostId,
      'MEETING_UPDATED',
      'Meeting Updated',
      `Your meeting "${title}" has been updated. Changes: ${changeDescription}`,
      meeting.id
    );
  }

  static async notifyMeetingCancelled(meeting) {
    const { hostId, participantId, title, startTime } = meeting;
    const formattedTime = new Date(startTime).toLocaleString();

    // Notify participant
    await this.createNotification(
      participantId,
      'MEETING_CANCELLED',
      'Meeting Cancelled',
      `The meeting "${title}" scheduled for ${formattedTime} has been cancelled`,
      meeting.id
    );

    // Notify host
    await this.createNotification(
      hostId,
      'MEETING_CANCELLED',
      'Meeting Cancelled',
      `Your meeting "${title}" scheduled for ${formattedTime} has been cancelled`,
      meeting.id
    );
  }

  static async notifyMeetingReminder(meeting) {
    const { hostId, participantId, title, startTime } = meeting;
    const formattedTime = new Date(startTime).toLocaleString();

    // Notify both participants
    for (const userId of [hostId, participantId]) {
      await this.createNotification(
        userId,
        'MEETING_REMINDER',
        'Meeting Reminder',
        `Reminder: Your meeting "${title}" is scheduled for ${formattedTime}`,
        meeting.id
      );
    }
  }
}

export default NotificationService;
