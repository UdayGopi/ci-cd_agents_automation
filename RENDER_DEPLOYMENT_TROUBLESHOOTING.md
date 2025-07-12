# Render Deployment Troubleshooting Guide

## Issue: DATABASE_URL not set during deployment

This is a common issue when deploying to Render where the database and web service aren't properly synchronized.

### Solution Steps:

#### 1. Manual Render Dashboard Setup (Recommended)

Instead of using render.yaml initially, set up through the Render dashboard:

1. **Create Database First**:
   - Go to Render Dashboard
   - Click "New" → "PostgreSQL"
   - Name: `pipelineforge-db`
   - Plan: Free/Starter
   - Wait for database to be provisioned

2. **Create Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `pipelineforge`
     - Environment: `Node`
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
     - Plan: Free/Starter

3. **Set Environment Variables**:
   - In web service settings, add:
     - `NODE_ENV` = `production`
     - `PORT` = `10000` 
     - `DATABASE_URL` = (copy from database dashboard)
     - `GROQ_API_KEY` = (your API key)

4. **Deploy**:
   - Trigger a new deployment
   - Monitor logs for successful connection

#### 2. Alternative render.yaml Configuration

If you prefer using render.yaml, try this approach:

```yaml
# Use render-deploy-fix.yaml instead of render.yaml
databases:
  - name: pipelineforge-db
    databaseName: pipelineforge
    user: pipelineforge_user
    plan: starter

services:
  - type: web
    name: pipelineforge
    env: node
    plan: starter
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: pipelineforge-db
          property: connectionString
      - key: GROQ_API_KEY
        sync: false
```

#### 3. Debug Environment Variables

If still failing, add this temporary debug start command:

```json
"start-debug": "node -e \"console.log('Environment Variables:'); console.log(Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('POSTGRES')).map(k => k + '=' + (process.env[k] ? 'SET' : 'NOT_SET')).join('\\n')); console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);\" && npm run start"
```

Then temporarily change start command in Render to: `npm run start-debug`

### Common Issues and Fixes:

1. **Database not provisioned**: 
   - Check database status in Render dashboard
   - Ensure database is "Available" before deploying web service

2. **Environment variable timing**:
   - Database URL might not be available immediately
   - Try redeploying after database is fully ready

3. **Service dependency order**:
   - Always create database before web service
   - Or use manual dashboard setup for guaranteed order

4. **GROQ_API_KEY missing**:
   - Set this manually in Render dashboard
   - Don't commit API keys to repository

### Verification Steps:

1. Check database status: Should show "Available"
2. Check web service logs: Should show successful database connection
3. Test health endpoint: `https://your-app.onrender.com/api/health`
4. Verify all environment variables are set in service settings

### Alternative Quick Fix:

If database connection continues to fail, you can temporarily modify the server to use a fallback:

```javascript
// In server/db.ts - TEMPORARY ONLY
const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DB_URL;
if (!databaseUrl) {
  console.error("No database URL found. Checked: DATABASE_URL, POSTGRES_URL, DB_URL");
  throw new Error("Database URL must be set");
}
```

This helps identify if the database URL is available under a different environment variable name.

### Success Indicators:

✅ Database shows "Available" status
✅ Web service logs show "Database connection successful"  
✅ Health check endpoint returns 200 OK
✅ Application loads without errors
✅ API endpoints respond correctly

Once working, you can switch back to using render.yaml for future deployments.