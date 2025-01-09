const { Sequelize } = require('sequelize');
const config = require('../config/config');

// Get the environment
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create Sequelize instance
let sequelize;
if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(dbConfig);
}

// Test the connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Initialize models
const Meeting = require('../models/Meeting')(sequelize, Sequelize.DataTypes);
const Notification = require('../models/Notification')(sequelize, Sequelize.DataTypes);

// Define associations
Meeting.hasMany(Notification, {
  foreignKey: 'relatedId',
  constraints: false,
  scope: {
    type: {
      [Sequelize.Op.like]: 'MEETING_%'
    }
  }
});

// Sync database
async function syncDatabase() {
  try {
    await sequelize.sync();
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
}

// Initialize database
async function initializeDatabase() {
  await testConnection();
  await syncDatabase();
}

// Export initialized models and sequelize instance
module.exports = {
  sequelize,
  Meeting,
  Notification,
  initializeDatabase
};
