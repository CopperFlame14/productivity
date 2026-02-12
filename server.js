require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authMiddleware = require('./middleware/auth');

const app = express();

// Connect to MongoDB
connectDB();

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/', limiter);

// Serve static files from public directory
app.use(express.static('public'));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const dailyRoutes = require('./routes/daily');
const goalsRoutes = require('./routes/goals');
const animeRoutes = require('./routes/anime');
const analyticsRoutes = require('./routes/analytics');
const leetcodeRoutes = require('./routes/leetcode');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/daily', authMiddleware, dailyRoutes);
app.use('/api/goals', authMiddleware, goalsRoutes);
app.use('/api/anime', authMiddleware, animeRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/leetcode', authMiddleware, leetcodeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════════╗
  ║  🎮 Gamified Productivity Tracker Server     ║
  ║  ✅ Server running on port ${PORT}              ║
  ║  🌐 http://localhost:${PORT}                   ║
  ╚═══════════════════════════════════════════════╝
  `);
});
