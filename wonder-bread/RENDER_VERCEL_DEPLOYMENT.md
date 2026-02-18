# Wonder Bread - Deployment Guide (Vercel + Render)

This guide explains how to deploy the **frontend to Vercel** and **backend to Render**.

---

## 🚀 Quick Overview

| Component               | Platform | Purpose                     |
| ----------------------- | -------- | --------------------------- |
| **Frontend** (React)    | Vercel   | Static site hosting + CDN   |
| **Backend** (Flask API) | Render   | Python serverless functions |

---

## 📋 Prerequisites

- GitHub account with repository pushed
- Vercel account (free at [vercel.com](https://vercel.com))
- Render account (free at [render.com](https://render.com))
- Backend API URL from Render (will get this during backend deployment)

---

## 🔧 Step 1: Deploy Backend to Render

### 1.1 Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository

### 1.2 Configure Backend Service

1. **Name**: `wonder-bread-backend` (or similar)
2. **Environment**: `Python 3`
3. **Build Command**:
   ```bash
   cd backend && pip install -r requirements.txt
   ```
4. **Start Command**:
   ```bash
   cd backend && gunicorn wonder_bread_app:app
   ```
5. **Plan**: Select "Free" tier

### 1.3 Set Environment Variables

In Render dashboard, go to **"Environment"** and add:

```env
JWT_SECRET_KEY=your_secure_key_here
FLASK_ENV=production
```

Generate a secure key:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 1.4 Deploy

- Click **"Create Web Service"**
- Render automatically deploys from your GitHub repo
- Wait for build to complete (2-3 minutes)
- Your backend URL will be: `https://wonder-bread-backend.onrender.com`

### 1.5 Install gunicorn

Add to `backend/requirements.txt`:

```
gunicorn>=21.0.0
```

---

## 🎨 Step 2: Deploy Frontend to Vercel

### 2.1 Update Backend URL

Before deploying, update the frontend to point to your Render backend:

**File: `frontend/.env.production`**

```env
REACT_APP_WONDER_BREAD_API_URL=https://wonder-bread-backend.onrender.com
```

Replace with your actual Render backend URL.

### 2.2 Push to GitHub

```bash
git add .
git commit -m "Update backend URL for Render deployment"
git push origin main
```

### 2.3 Connect to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Select your GitHub repository
4. Click **"Import"**

### 2.4 Configure Vercel Build

Vercel should auto-detect settings from `vercel.json`:

- **Framework Preset**: React
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/build`
- **Root Directory**: `wonder-bread/` (if deploying from monorepo)

### 2.5 Deploy

- Click **"Deploy"**
- Wait for build to complete (1-2 minutes)
- Your frontend URL: `https://your-project.vercel.app`

### 2.6 Verify Deployment

1. Open `https://your-project.vercel.app`
2. Try to sign up / login
3. Should connect to Render backend successfully

---

## 📱 Local Development

### Backend (Render/Python)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python wonder_bread_app.py
```

Backend runs at: `http://localhost:5001`

### Frontend (Vercel/React)

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

Set `.env.local` for local development:

```env
REACT_APP_WONDER_BREAD_API_URL=http://localhost:5001
```

---

## 🔄 Automatic Deployments

### Frontend (Vercel)

- Automatically deploys on any push to `main` branch
- Deployments take 1-2 minutes

### Backend (Render)

- Automatically deploys on any push to `main` branch
- Deployments take 2-3 minutes
- First request after idle may take 10+ seconds (cold start)

---

## ⚙️ Environment Variables

### Vercel (Frontend)

No environment variables needed - API URL is in code

### Render (Backend)

- `JWT_SECRET_KEY`: Secure random key (required)
- `FLASK_ENV`: `production` (optional)
- `DATABASE_URL`: Only if using external database

---

## 🐛 Troubleshooting

### Frontend can't reach API

**Problem**: `Error: Failed to fetch from API`

**Solutions**:

1. Verify backend URL in `frontend/.env.production`
2. Check Render backend is running: `https://your-backend.onrender.com/api/products`
3. Ensure CORS is enabled in Flask (should be by default)
4. Check browser console for exact error

### Backend cold start

**Problem**: First request takes 10+ seconds

**Solution**: This is normal for free tier. Requests after initial request are fast.

### Database errors

**Problem**: `Error: Database not found`

**Solution**:

- SQLite won't persist between cold starts on Render
- Use PostgreSQL instead:
  1. On Render, create PostgreSQL database
  2. Add `DATABASE_URL` environment variable to backend service
  3. Update `backend/wonder_bread_app.py` to use PostgreSQL

### Deployment failed

**Steps to debug**:

1. Check build logs in Vercel/Render dashboard
2. Verify all environment variables are set
3. Ensure `requirements.txt` has all dependencies
4. Test locally: `npm run build` and check for errors

---

## 🎯 Common Tasks

### Update Backend

```bash
# Make changes to backend code
git add backend/
git commit -m "Update backend logic"
git push origin main
# Render auto-deploys automatically
```

### Update Frontend

```bash
# Make changes to frontend code
git add frontend/
git commit -m "Update UI components"
git push origin main
# Vercel auto-deploys automatically
```

### Change Backend URL

1. Edit `frontend/.env.production`
2. Update `REACT_APP_WONDER_BREAD_API_URL`
3. Push to GitHub
4. Vercel auto-redeploys

### Add Environment Variables

**Frontend (Vercel)**:

- Dashboard → Project Settings → Environment Variables

**Backend (Render)**:

- Dashboard → Web Service → Environment
- Add new variables
- Auto-redeploys

---

## 📊 Monitoring

### Vercel Analytics

- Dashboard shows deployments, builds, errors
- Automatic performance monitoring

### Render Logs

- Dashboard → Web Service → Logs
- See real-time request logs and errors

---

## 🔐 Security Checklist

Before going to production:

- [ ] Change `JWT_SECRET_KEY` to a secure random value
- [ ] Set `FLASK_ENV=production` on Render
- [ ] Test all authentication flows (signup, login, orders)
- [ ] Verify HTTPS is enabled (both platforms do this by default)
- [ ] Test with real payment data (if implementing payments)
- [ ] Monitor Render logs for errors
- [ ] Set up email notifications for deployment failures

---

## 📈 Scalability

### Current Setup (Free Tier)

- ✅ Perfect for MVP / testing
- ✅ Handles moderate traffic (~1000 requests/day)
- ⚠️ Cold starts may occur on Render backend
- ⚠️ SQLite database won't persist

### Production Setup (Paid)

- Use Vercel Pro for better performance
- Use Render paid tier to prevent cold starts
- Switch to PostgreSQL/MySQL for database
- Add caching layer (Redis)
- Enable CDN for assets

---

## 🚀 Next Steps

1. Deploy backend to Render
2. Get Render backend URL
3. Update `frontend/.env.production` with backend URL
4. Deploy frontend to Vercel
5. Test full workflow: signup → browse → order
6. Monitor logs for errors
7. Iterate and improve!

---

## 📞 Support

- Vercel docs: https://vercel.com/docs
- Render docs: https://render.com/docs
- GitHub Issues: Add troubleshooting details

---

**Happy deploying! 🍞**
