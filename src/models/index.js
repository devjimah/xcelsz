'use strict';

const db = require('../lib/db');

// Initialize database on first import
db.initializeDatabase();

module.exports = db;
