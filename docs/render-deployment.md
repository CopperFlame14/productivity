# 🚀 Render Deployment Guide

## Prerequisites
- GitHub repository (we'll create this first)
- MongoDB Atlas connection string (you already have this!)

---

## Step 1: Push to GitHub

### Option A: Using GitHub CLI (if you have `gh` installed)
```bash
gh repo create gamified-productivity-tracker --public --source=. --remote=origin --push
```

### Option B: Manual GitHub Setup

1. Go to https://github.com/new
2. Repository name: `gamified-productivity-tracker`
3. **Do NOT** check "Initialize with README"
4. Click "Create repository"
5. Run these commands (replace YOUR-USERNAME):

```bash
git remote add origin https://github.com/YOUR-USERNAME/gamified-productivity-tracker.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Render

### 2.1: Create Render Account
1. Go to https://render.com
2. Sign up (free tier available - no credit card needed!)
3. Click "Sign in with GitHub" (easiest method)

### 2.2: Create Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub account (if not already)
3. Select the `gamified-productivity-tracker` repository
4. Fill in the details:

**Basic Settings:**
- **Name**: `productivity-tracker` (or any name)
- **Environment**: `Node`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- Choose **"Free"** ($0/month)

### 2.3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these (5 variables):

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://Krish:Japan@cluster0.sovbk7z.mongodb.net/productivity-tracker?retryWrites=true&w=majority&appName=Cluster0` |
| `JWT_SECRET` | `gamified-productivity-2026-secret-key-change-in-production` |
| `JWT_EXPIRE` | `7d` |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |

### 2.4: Deploy!
1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your GitHub repo
   - Run `npm install`
   - Start the server
   - Give you a live URL like: `https://productivity-tracker-xxxx.onrender.com`

---

## Step 3: Update Frontend API URLs

After deployment, you need to update the API URLs in your frontend:

**Files to update:**
- `public/js/auth.js`
- `public/js/dashboard.js`  
- `public/js/anime.js`
- `public/goals.html`
- `public/analytics.html`

**Change this:**
```javascript
const API_BASE = 'http://localhost:3000/api';
```

**To this:**
```javascript
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:3000/api'
  : '/api';
```

This makes it work both locally AND on Render!

Then commit and push:
```bash
git add .
git commit -m "Update API URLs for production"
git push
```

Render will auto-deploy the changes!

---

## ✅ Render Free Tier Benefits

- **750 hours/month** free
- **Automatic HTTPS**
- **Auto-deploy on Git push**
- **No credit card required**
- **Custom domains** (optional)

---

## 🔧 Troubleshooting

### App shows "Service Unavailable"
- Check Render logs (click "Logs" tab)
- Verify MongoDB connection string is correct
- Make sure IP allowlist in MongoDB Atlas is set to `0.0.0.0/0`

### Can't connect to database
- Go to MongoDB Atlas → Network Access
- Add IP: `0.0.0.0/0` (allows Render to connect)

---

## 🎯 Your Deployment URL

After deployment completes, you'll get a URL like:
```
https://productivity-tracker-xxxx.onrender.com
```

Share this link with anyone - your app is now live! 🎉

---

## Next Steps After Deployment

1. Test the live app
2. Create an account on the live site
3. Track some tasks
4. Share the URL!

Need help with any step? Just ask!
