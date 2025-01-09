'use strict';

module.exports = (sequelize, DataTypes) => {
  const Meeting = sequelize.define('Meeting', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'UTC'
    }
  }, {
    tableName: 'Meetings',
    timestamps: true,
    indexes: [
      {
        fields: ['hostId']
      },
      {
        fields: ['participantId']
      },
      {
        fields: ['startTime']
      }
    ]
  });

  Meeting.associate = function(models) {
    // Add associations here when User model is created
    // Meeting.belongsTo(models.User, { as: 'host', foreignKey: 'hostId' });
    // Meeting.belongsTo(models.User, { as: 'participant', foreignKey: 'participantId' });
  };

  return Meeting;
};
