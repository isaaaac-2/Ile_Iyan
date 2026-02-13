# Ile Iyan Deployment Changes Log

## Overview

This document tracks all changes made to deploy the Ile Iyan application to Vercel. Each change is documented with the issue encountered, the solution implemented, files modified, and expected outcomes.

---

## CHANGE 1: Initial Vercel Configuration Setup

**Date:** February 13, 2026

### Issue

The project needed to be deployed to Vercel but had no configuration for combining a React frontend with a Flask backend on a single Vercel instance.

### Solution

Created a Vercel configuration file that:

- Builds the React frontend using `npm run build`
- Configures the output directory to `frontend/build`
- Allows auto-detection of the Python API serverless functions

### Files Modified

- **Created:** `vercel.json`
  - Version: 2
  - Build command: `cd frontend && npm install && npm run build`
  - Output directory: `frontend/build`

### Expected Outcome

Vercel will automatically build the React app and detect the `/api/index.py` serverless function for backend routes.

---

## CHANGE 2: Created API Serverless Entry Point

**Date:** February 13, 2026

### Issue

Vercel needed a Python entry point to create serverless functions. The existing Flask app in `backend/app.py` needed to be accessible as a serverless function.

### Solution

Created `/api/index.py` that:

- Adds the backend directory to Python's path
- Imports and exports the Flask app from `backend/app.py`
- Acts as the entry point for all `/api/*` serverless function calls

### Files Created

- **`api/index.py`**

  ```python
  import sys
  import os
  sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
  from app import app
  ```

- **`api/requirements.txt`**
  - Contains all Python dependencies (flask, flask-cors, gTTS, python-dotenv)

### Expected Outcome

Vercel will deploy the Flask app as a serverless function accessible at `/api/*` endpoints.

---

## CHANGE 3: Fixed React Hook Dependencies in VoiceBot

**Date:** February 13, 2026

### Issue

ESLint error: `React Hook useEffect has missing dependencies: 'addBotMessage' and 'lastSpokenText'`

This prevented the React app from building successfully.

### Solution

Restructured the useEffect hook to:

- Use a ref (`initializationRef`) to ensure the greeting only shows once
- Call state setters directly instead of using `addBotMessage`
- Only include `speakText` (which depends on `ttsEnabled`) in the dependency array
- Properly manage the greeting initialization without missing dependencies

### Files Modified

- **`frontend/src/components/VoiceBot.js`** (lines 95-127)
  - Changed from using `addBotMessage()` to direct state setters
  - Added `initializationRef` to track initialization status
  - Updated useEffect dependency array to `[speakText]`

### Expected Outcome

ESLint warnings are resolved and the React app builds successfully without errors.

---

## CHANGE 4: Configured Production API URL

**Date:** February 13, 2026

### Issue

The frontend needed different API URLs for development vs. production:

- **Development (localhost):** Should default to `http://localhost:5000`
- **Production (Vercel):** Should use relative paths `/api` to hit the serverless functions

### Solution

Created environment files to control the API base URL:

### Files Created/Modified

- **`frontend/.env.local`**

  ```
  REACT_APP_API_URL=http://localhost:5000
  ```

- **`frontend/.env.production`**

  ```
  REACT_APP_API_URL=
  ```

- **`frontend/src/services/api.js`** (lines 1-8)
  - Updated API_BASE logic to use empty string for production (relative paths)
  - Defaults to localhost:5000 only when REACT_APP_API_URL is undefined

### Expected Outcome

- **Locally:** Frontend calls `http://localhost:5000/api/menu`
- **On Vercel:** Frontend calls `/api/menu` (routed to serverless function)

---

## CHANGE 5: Ensured Backend CORS Configuration

**Date:** February 13, 2026

### Issue

The Flask backend needed to allow cross-origin requests from the deployed Vercel frontend domain.

### Solution

Verified that CORS is properly configured in the Flask app:

### Files Verified

- **`backend/app.py`** (lines 10-11)
  ```python
  app = Flask(__name__)
  CORS(app)
  ```

### Expected Outcome

The Flask backend accepts requests from any origin, allowing the Vercel-deployed frontend to access the serverless API endpoints.

---

## CHANGE 6: Reset to Stable Commit

**Date:** February 13, 2026

### Issue

After multiple configuration attempts, the codebase had conflicting configurations that prevented Vercel from building successfully.

### Solution

Reset the entire repository to commit `fe07191b8138b1453486f786d3a8e4ebfd2feb8a` which represented a stable state before configuration issues arose.

### Command Executed

```bash
git reset --hard fe07191b8138b1453486f786d3a8e4ebfd2feb8a
git push --force
```

### Expected Outcome

Repository is restored to a known-good state with clean configuration files.

---

## CHANGE 7: Fixed Python Runtime Format in vercel.json

**Date:** February 13, 2026

### Issue

Vercel build error: `Function Runtimes must have a valid version, for example 'now-php@1.0.0'`

The runtime format in vercel.json was incorrect (used `python3.9` instead of correct format).

### Solution

Removed the `functions` block with invalid runtime specification and allowed Vercel to auto-detect the Python API instead.

### Files Modified

- **`vercel.json`**
  - Removed: `functions` block with `runtime: "python3.9"`
  - Kept: `buildCommand` and `outputDirectory` for React build
  - Result: Simple, clean configuration that lets Vercel auto-detect

### Expected Outcome

Vercel successfully builds without runtime format errors and auto-detects `/api/index.py` as a serverless function.

---

## Current Status

✅ **React Frontend:** Configured to build with `npm run build`
✅ **Flask Backend:** Accessible as serverless function via `/api/index.py`
✅ **Environment Variables:** Properly configured for dev and production
✅ **CORS:** Enabled on backend
✅ **Vercel Configuration:** Simplified and correct

### What Works

- Local development: Frontend connects to `http://localhost:5000/api/*`
- Production on Vercel: Frontend connects to `/api/*` (serverless functions)
- Menu loading, orders, and voice bot functionality should work on both local and deployed versions

---

## Next Steps (If Issues Persist)

1. **Check Vercel Runtime Logs:**
   - Go to vercel.com → Project → Latest Deployment → Runtime Logs
   - Look for any error messages when calling `/api/menu`

2. **Test Backend Locally:**

   ```bash
   cd backend
   python app.py
   # Should start on http://localhost:5000
   ```

3. **Test Frontend Locally:**
   ```bash
   cd frontend
   npm start
   # Should connect to backend and display menu
   ```

---

## CHECKPOINT: Before Vercel Serverless Fix Attempt

**Date:** February 13, 2026, 17:45 UTC
**Commit Hash:** 74337c5
**Git Tag:** `checkpoint-before-vercel-fix`

### Status at This Point

- React frontend configured and building
- Vercel configuration created but backend not working for other devices
- Decision made to attempt fixing Vercel serverless instead of switching to separate hosting

### How to Revert to This Point

If the Vercel serverless fix doesn't work, revert using:

```bash
git reset --hard checkpoint-before-vercel-fix
git push --force
```

---

## UPCOMING: Vercel Serverless Fix Attempts

Will document all attempts to fix the serverless backend deployment here.

---

## FIX ATTEMPT 1: Add Explicit Routes to vercel.json

**Date:** February 13, 2026, 18:00 UTC

### Issue

The `/api/index.py` serverless function was defined in `vercel.json` but Vercel didn't know **how to route** requests to it. Without explicit `routes` configuration, Vercel was returning 404 for all `/api/*` calls.

### Why This Works

The `functions` property tells Vercel which files are serverless functions, but the `routes` property tells it **which URLs should go to which functions**. Without `routes`, there was no mapping between `/api/menu` and the Python function.

### Solution & Changes

**File Modified:** `vercel.json`

**Added:**

```json
"routes": [
  {
    "src": "/api/(.*)",
    "dest": "api/index.py"
  },
  {
    "src": "/(.*)",
    "dest": "frontend/build/$1"
  },
  {
    "src": "/(.+)",
    "dest": "frontend/build/index.html"
  }
]
```

**What Each Route Does:**

1. `/api/(.*)` → Routes all API calls to the Python serverless function
2. `/(.*)` → Serves static files from the React build
3. `/(.+)` → Falls back to `index.html` for React client-side routing

### Expected Outcome

✅ Requests to `https://ile-iyan.vercel.app/api/menu` are now routed to the serverless function
✅ Frontend static files are served correctly
✅ React routing (SPA) works through index.html fallback

### How to Test

After Vercel redeploys:

- From any device, visit: `https://ile-iyan.vercel.app/api/health`
- Should return JSON (either the greeting or error message)
- Main app should load menu correctly

---

## UPCOMING: Further Fixes (If Needed)

Will document here...

---

## Files Structure

```
Ile_Iyan/
├── vercel.json                 (Vercel config - auto-detects API)
├── api/
│   ├── index.py               (Serverless entry point)
│   └── requirements.txt        (Python dependencies)
├── backend/
│   ├── app.py                 (Flask application)
│   ├── requirements.txt        (Python dependencies)
│   └── ...
├── frontend/
│   ├── .env.local             (Dev API URL)
│   ├── .env.production        (Prod API URL)
│   ├── package.json           (React config)
│   ├── src/
│   │   ├── services/api.js    (API calls)
│   │   └── ...
│   └── ...
└── README.md
```

---

**Last Updated:** February 13, 2026, 17:30 UTC
**Status:** Ready for deployment to Vercel
