const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const express = require('express');
const Sentry = require('@sentry/node');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const teamRoutes = require('./routes/teamRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

const config = require('./config/config');

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? [config.FRONTEND_URL]
        : [config.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  })
);

// Response interceptor middleware to sanitize error details in production
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (data) {
    if (process.env.NODE_ENV === 'production' && data && typeof data === 'object') {
      if ('error' in data) {
        data.error = undefined; // Strip detailed error messages in production
      }
    }
    return originalJson.call(this, data);
  };
  next();
});

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(morgan('dev'));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, //15 minutes
  max: 100,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 6,
  message: { message: 'Too many login attempts from this IP, please try again after 15 minutes.' },
});

app.use('/api/', globalLimiter);
app.use('/api/auth', authLimiter);

// Mount the routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('HackFlow API is running smoothly...');
});

// Sentry error handler must be registered before any other error middleware and after all controllers
Sentry.setupExpressErrorHandler(app);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message,
  });
});

module.exports = app;
