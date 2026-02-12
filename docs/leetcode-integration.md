# LeetCode Auto-Detection - Implementation Example

This demonstrates how the LeetCode auto-detection feature integrates into the dashboard.

## Usage in Dashboard

```html
<!-- In dashboard.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - Gamified Productivity Tracker</title>
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="stylesheet" href="/css/leetcode-panel.css">
</head>
<body>
  <div class="container">
    <h1>📊 Daily Dashboard</h1>
    
    <!-- LeetCode Panel -->
    <div id="leetcode-container"></div>
    
    <!-- Other tasks -->
    <div class="task-list">
      <!-- Workout, Project, Study, Water tasks... -->
    </div>
  </div>

  <script src="/js/leetcode-panel.js"></script>
  <script src="/js/dashboard.js"></script>
</body>
</html>
```

```javascript
// In dashboard.js

// Initialize LeetCode panel
let leetcodePanel;

async function initDashboard() {
  // Create LeetCode panel instance
  leetcodePanel = new LeetCodePanel('leetcode-container');
  
  // Load today's data
  await loadTodayData();
}

async function loadTodayData() {
  // Check for LeetCode auto-detection
  const problemsCompleted = await leetcodePanel.getProblemsCompleted();
  
  console.log('LeetCode problems completed:', problemsCompleted);
  
  // Use in reward calculation
  calculateRewards(problemsCompleted);
}

function calculateRewards(leetcodeProblems) {
  let animeEpisodes = 0;
  
  // Base reward
  if (leetcodeProblems >= 1) {
    animeEpisodes += 1;
  }
  
  // Bonus rewards
  if (leetcodeProblems >= 2) {
    animeEpisodes += (leetcodeProblems - 1) * 0.5;
  }
  
  console.log('Total anime episodes unlocked:', animeEpisodes);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initDashboard);
```

## Backend Integration

```javascript
// In server.js - Add LeetCode routes

const express = require('express');
const app = express();
const authMiddleware = require('./middleware/auth');

// Mount LeetCode routes
const leetcodeRoutes = require('./routes/leetcode');
app.use('/api/leetcode', authMiddleware, leetcodeRoutes);

// Other routes...
```

## How It Works

### 1. Initial Setup
- User clicks "⚙️ Configure Auto-Detection"
- Enters LeetCode username
- Clicks "Validate Username" to verify profile is accessible
- Enables auto-detection toggle
- System stores current problem count as baseline

### 2. Daily Auto-Detection
- When user visits dashboard, `checkAutoDetection()` is called
- System fetches current problem count from LeetCode API
- Compares with stored baseline
- Calculates problems solved today

### 3. Graceful Fallback
If API fails at any step:
- **Network error** → Mode: Failed ❌
- **Invalid username** → Mode: Manual ⌨️
- **Timeout** → Mode: Failed ❌
- **Private profile** → Mode: Failed ❌

User can always enter problems manually.

### 4. Productivity System Integration
```javascript
// Even if auto-detection fails, system works normally

function calculateProductivityScore() {
  // Get LeetCode problems (auto or manual)
  const leetcodeProblems = leetcodePanel 
    ? await leetcodePanel.getProblemsCompleted()
    : document.getElementById('leetcode-problems')?.value || 0;
  
  // Normalize
  const normalized = Math.min(1.2, leetcodeProblems / 1); // target = 1
  
  // Apply weight
  const score = normalized * 0.25; // 25% weight
  
  return score;
}
```

## API Endpoints

### `POST /api/leetcode/check`
Check for new problems solved
```json
Response:
{
  "mode": "auto",
  "completed": 2,
  "newCount": 157,
  "message": "✅ Detected 2 new problem(s) solved!"
}
```

### `POST /api/leetcode/validate`
Validate username
```json
Request: { "username": "john_doe" }

Response:
{
  "valid": true,
  "message": "✅ LeetCode username 'john_doe' verified! Total problems: 155"
}
```

### `PUT /api/leetcode/settings`
Update settings
```json
Request:
{
  "leetcodeUsername": "john_doe",
  "leetcodeAutoDetect": true
}

Response:
{
  "success": true,
  "message": "LeetCode settings updated",
  "settings": {
    "leetcodeUsername": "john_doe",
    "leetcodeAutoDetect": true,
    "leetcodeLastCount": 155
  }
}
```

### `GET /api/leetcode/settings`
Get current settings
```json
Response:
{
  "leetcodeUsername": "john_doe",
  "leetcodeAutoDetect": true,
  "leetcodeLastCount": 155
}
```

## Status Indicators

### Auto ✅
- Auto-detection enabled
- Username configured
- API working
- Problems detected automatically

### Manual ⌨️
- Auto-detection disabled OR
- Username not configured OR
- User preference

### Failed ❌
- API request failed
- Network error
- Invalid username
- Private profile
- Timeout

**In all cases, manual input is available as fallback!**

## Future Updates

To update the API logic (e.g., LeetCode changes their GraphQL endpoint):

1. Edit `utils/leetcode.js`
2. Update the `fetchLeetCodeStats` function
3. Change GraphQL query or endpoint
4. No changes needed in UI or other parts

The modularity ensures easy maintenance.
