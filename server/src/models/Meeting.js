const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Meeting extends Model {
    static associate(models) {
      Meeting.hasMany(models.Notification, {
        foreignKey: 'relatedId',
        constraints: false,
        scope: {
          type: ['MEETING_CREATED', 'MEETING_UPDATED', 'MEETING_CANCELLED']
        }
      });
    }
  }

  Meeting.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: DataTypes.TEXT,
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30
    },
    hostId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    participantId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'cancelled', 'completed'),
      defaultValue: 'scheduled'
    }
  }, {
    sequelize,
    modelName: 'Meeting',
  });

  return Meeting;
};
