require('dotenv').config();
const path = require('path');

const config = {
  development: {
    dialect: 'sqlite',
    storage: path.join(process.cwd(), 'database.sqlite'),
    logging: console.log
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  },
  production: {
    dialect: 'sqlite',
    storage: path.join(process.cwd(), 'database.sqlite'),
    logging: false
  }
};

console.log('Database config:', {
  dialect: config.development.dialect,
  storage: config.development.storage
});

module.exports = config;
