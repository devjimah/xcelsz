require('dotenv').config();
const { Sequelize } = require('sequelize');

async function initDatabase() {
  // First connect without database to create it
  const sequelize = new Sequelize({
    dialect: 'mysql',
    host: 'localhost',
    port: 18443,
    username: 'admin',
    password: process.env.DB_PASSWORD,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    },
    logging: console.log
  });

  try {
    // Try to authenticate
    await sequelize.authenticate();
    console.log('Connected to MySQL successfully.');

    // Create database if it doesn't exist
    await sequelize.query('CREATE DATABASE IF NOT EXISTS jobplatform;');
    console.log('Database jobplatform created or already exists.');

    // Close initial connection
    await sequelize.close();

    // Connect to the specific database
    const dbSequelize = new Sequelize({
      dialect: 'mysql',
      host: 'localhost',
      port: 18443,
      username: 'admin',
      password: process.env.DB_PASSWORD,
      database: 'jobplatform',
      dialectOptions: {
        ssl: {
          rejectUnauthorized: false
        }
      },
      logging: console.log
    });

    // Test connection to the new database
    await dbSequelize.authenticate();
    console.log('Connected to jobplatform database successfully.');
    await dbSequelize.close();

  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

initDatabase();
