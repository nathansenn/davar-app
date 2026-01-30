# Davar API Deployment

## Production URL
https://davar-backend-production.up.railway.app

## Environment
- **Railway Project:** davar-api
- **Railway Project ID:** 442671e3-2b05-479e-b64e-83e8e4e56513
- **Service:** davar-backend
- **Database:** PostgreSQL (Railway)
- **Region:** us-west1

## GitHub Repository
https://github.com/nathansenn/davar-app (public)

## Environment Variables
Set in Railway:
- `DATABASE_URL` - Auto-linked from Postgres service
- `JWT_SECRET` - Secure random string (generated at deploy time)
- `NODE_ENV` - production
- `PORT` - 3000

## Endpoints

### Health Check
```
GET /health
Response: {"status":"ok","timestamp":"..."}
```

### Authentication
```
POST /auth/register
Body: {"email":"string","password":"string"}

POST /auth/login
Body: {"email":"string","password":"string"}

POST /auth/logout (requires auth)
GET /auth/me (requires auth)
```

### Sync (requires auth)
```
POST /sync/push
GET /sync/pull?lastSyncAt=timestamp
```

## Database Management

### View database in Prisma Studio
```bash
cd backend
DATABASE_URL="postgresql://postgres:REDACTED@shinkansen.proxy.rlwy.net:24073/railway" npx prisma studio
```

### Push schema changes
```bash
cd backend
DATABASE_URL="postgresql://postgres:...@shinkansen.proxy.rlwy.net:24073/railway" npx prisma db push
```

## Deployment

### Current: Direct upload
```bash
cd backend
railway up
```

### TODO: Switch to GitHub Integration
The Railway CLI couldn't connect to GitHub private repos. To enable auto-deploy:
1. Go to Railway dashboard
2. Connect GitHub account if not already
3. Link the service to github.com/nathansenn/davar-app
4. Set root directory to `/backend`
5. Set branch to `master`

## Deployed: 2026-01-30
