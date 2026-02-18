# Deploying Wonder Bread to Vercel

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Node.js & npm**: Installed locally for development

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select your **GitHub repository** (Ile_Iyan)
4. Click **"Import"**

### 2. Configure Build Settings

Vercel should auto-detect the configuration from `vercel.json`. If not, manually set:

- **Framework Preset**: React
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/build`
- **Root Directory**: `wonder-bread/` (if deploying from a monorepo)

### 3. Set Environment Variables

In the Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```env
JWT_SECRET_KEY=your_secure_secret_key_here
FLASK_ENV=production
```

**Important**: Use a secure, random string for `JWT_SECRET_KEY`. You can generate one using:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 4. Configure API Endpoint (Frontend)

Create a `.env.production` file in the `frontend/` directory:

```env
REACT_APP_WONDER_BREAD_API_URL=/api
```

This ensures the frontend API calls route through Vercel's serverless functions.

### 5. Deploy

- **Automatic**: Push to your GitHub branch (if connected)
- **Manual**: Click **"Deploy"** button in Vercel dashboard

The deployment will:

1. Build the React frontend and output static files
2. Deploy backend as Python serverless functions at `/api/*`
3. Rewrite frontend routes for SPA routing

## API Endpoints

After deployment, your API will be accessible at:

```
https://your-vercel-domain.vercel.app/api/auth/login
https://your-vercel-domain.vercel.app/api/auth/register
https://your-vercel-domain.vercel.app/api/profile
https://your-vercel-domain.vercel.app/api/orders
```

## Important Notes

### Database Persistence

The current SQLite database (`wonder_bread.db`) is **local to each cold start** on Vercel serverless. For production:

**Option 1: Use Vercel KV (Redis)** - Quick setup

```bash
vercel env pull  # Pull KV database URL
```

**Option 2: Use PostgreSQL/MySQL** - More reliable

- Add a database service (Supabase, PlanetScale, Railway, etc.)
- Update `backend/wonder_bread_app.py` to use connection string

**Option 3: SQLite with persistent storage**

- Store database in `/tmp` (persists within a cold start)
- Regularly backup to external storage

### CORS Configuration

CORS is enabled in the Flask backend. Vercel automatically handles CORS for same-origin requests. If you get CORS errors:

1. Check `backend/wonder_bread_app.py` - CORS should be enabled
2. Verify API_BASE_URL in `frontend/src/services/api.js` matches your domain

### Cold Start Optimization

Cold start takes 5-10 seconds from Python dependencies. To improve:

1. Minimize Python dependencies
2. Keep function bundle size small
3. Use Vercel's caching

## Monitoring & Debugging

- **Vercel Dashboard**: View logs and performance
- **Analytics**: Monitor API usage and errors
- **Local Testing**: Run `npm run dev` in frontend folder

## Rollback

If something breaks:

1. Go to Vercel dashboard
2. Click on a previous deployment
3. Click **"Promote to Production"**

## Custom Domain

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain (e.g., `wonderbread.com`)
3. Update DNS records as instructed

## Troubleshooting

**API 500 errors**: Check Vercel function logs

```
vercel logs <function-name>
```

**Frontend can't reach API**: Verify `REACT_APP_WONDER_BREAD_API_URL` environment variable

**Database not persisting**: Implement proper database solution (see Database Persistence section)

**Build fails**: Check `vercel deploy --prod --verbose` output

---

For more help: [Vercel Docs](https://vercel.com/docs)
