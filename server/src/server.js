require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./models');

const app = express();
// Render assigns a dynamic port, so we should use that when available
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://xcelsz-task.vercel.app',
  'https://xcelsz-task-git-main-ghl05.vercel.app',
  'https://xcelsz-task-ghl05.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to XcelSz API',
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

// Routes
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/notifications', require('./routes/notifications'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
