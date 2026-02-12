# 🎮 Gamified Productivity Tracker

A game-like productivity dashboard combining task tracking, rewards, analytics, and wellness monitoring with full backend authentication.

## Features

- ✅ **Daily Task System**: Track workout, LeetCode, projects, study, and water intake
- 🎥 **Anime Reward System**: Unlock episodes by completing tasks
- 🧠 **LeetCode Auto-Detection**: Automatic problem detection with graceful fallback
- 📊 **Data Science Productivity Engine**: Weighted scoring, 7-day averages, rank system
- 🔥 **Streak Tracking**: Increase score multipliers with consistency
- ❤️ **Health Meter (HP)**: Wellness tracking with penalties
- ⚡ **XP & Leveling**: Gain XP and level up for bonus rewards
- 🎯 **Custom Goals & Hobbies**: Personalized task management
- 🧬 **Burnout Detection**: Wellness monitoring and warnings
- 🏅 **Achievements**: Unlockable badges
- 🔐 **User Authentication**: Secure JWT-based auth with MongoDB
- ☁️ **Cloud Sync**: Access your data across devices

## Technology Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Modern dark theme design
- Responsive mobile-first layout

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)

### Setup

1. **Clone or navigate to the project directory**
   ```bash
   cd c:\Users\krish\Documents\web\productivity
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update MongoDB connection string if needed
   - Change JWT secret in production

4. **Start MongoDB**
   - If using local MongoDB:
     ```bash
     mongod
     ```
   - Or use MongoDB Atlas (cloud)

5. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

6. **Open the application**
   - Navigate to `http://localhost:3000`
   - Create an account and start tracking!

## Project Structure

```
productivity/
├── server.js              # Express server
├── package.json           # Dependencies
├── .env                   # Environment variables
├── config/
│   └── db.js             # MongoDB connection
├── middleware/
│   └── auth.js           # JWT authentication
├── models/
│   ├── User.js           # User schema
│   ├── DailyRecord.js    # Daily tracking
│   ├── Goal.js           # Custom goals
│   └── Achievement.js    # Achievements
├── routes/
│   ├── auth.js           # Authentication
│   ├── user.js           # User management
│   ├── daily.js          # Daily records
│   ├── goals.js          # Goals CRUD
│   ├── anime.js          # Anime rewards
│   ├── analytics.js      # Analytics
│   └── leetcode.js       # LeetCode integration
├── utils/
│   ├── calculations.js   # Game mechanics
│   └── leetcode.js       # LeetCode API
└── public/
    ├── index.html        # Login page
    ├── signup.html       # Signup page
    ├── dashboard.html    # Main dashboard
    ├── anime.html        # Anime rewards
    ├── css/
    │   ├── styles.css          # Main styles
    │   └── leetcode-panel.css  # LeetCode panel
    └── js/
        ├── auth.js             # Authentication
        ├── dashboard.js        # Dashboard logic
        ├── anime.js            # Anime rewards
        └── leetcode-panel.js   # LeetCode panel
```

## API Documentation

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### User
- `GET /api/user` - Get profile
- `PUT /api/user` - Update profile
- `DELETE /api/user` - Delete account

### Daily Records
- `POST /api/daily` - Save daily record
- `GET /api/daily` - Get today's record
- `GET /api/daily/history?days=30` - Get history
- `POST /api/daily/reset` - Reset tasks

### Goals
- `POST /api/goals` - Create goal
- `GET /api/goals` - Get all goals
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `POST /api/goals/schedule` - Calculate smart schedule

### Anime
- `GET /api/anime/balance` - Get episode balance
- `POST /api/anime/watch` - Watch episode
- `GET /api/anime/history` - Watch history

### LeetCode
- `POST /api/leetcode/check` - Check for new problems
- `POST /api/leetcode/validate` - Validate username
- `PUT /api/leetcode/settings` - Update settings
- `GET /api/leetcode/settings` - Get settings

### Analytics
- `GET /api/analytics/productivity` - Productivity trends
- `GET /api/analytics/streak` - Streak data
- `GET /api/analytics/achievements` - Achievements

## Productivity Scoring

**Target Values:**
- Workout: 20 minutes
- LeetCode: 1 problem
- Project: 30 minutes
- Study: 20 minutes
- Water: 8 glasses

**Weights:**
- Workout: 20%
- LeetCode: 25%
- Project: 25%
- Study: 20%
- Water: 10%

**Rank System:**
- S: 90-100 (Gold)
- A: 75-89 (Silver)
- B: 50-74 (Bronze)
- C: <50 (Gray)

**Streak Multipliers:**
- 3+ days: 1.05x
- 7+ days: 1.10x
- 14+ days: 1.15x

## License

MIT
"# productivity" 
