const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.Meeting, {
        foreignKey: 'relatedId',
        as: 'meeting'
      });
    }
  }

  Notification.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['MEETING_INVITATION', 'MEETING_UPDATE', 'MEETING_CANCELLED', 'MEETING_RESCHEDULE']]
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    relatedId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Meetings',
        key: 'id'
      }
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Notification',
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['relatedId']
      },
      {
        fields: ['read']
      }
    ]
  });

  return Notification;
};
