# Deployment Guide

## Option 1: Docker Compose (Recommended for VPS/Cloud)

### Prerequisites
- Docker and Docker Compose installed
- Domain name (optional)

### Steps
1. Clone the repository
2. Create `.env` file in root:
```env
JWT_SECRET=your-random-secret-key-here
CORS_ORIGIN=http://your-domain.com
```

3. Run:
```bash
docker-compose up -d
```

4. Access at `http://localhost` or your domain

## Option 2: Render (Free Tier Available)

### Steps
1. Push code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New +" → "Blueprint"
4. Connect your GitHub repository
5. Render will auto-detect `render.yaml`
6. Set environment variables:
   - `MONGODB_URI`: Use Render's MongoDB or MongoDB Atlas
   - `CORS_ORIGIN`: Your frontend URL
7. Deploy

## Option 3: Railway

### Steps
1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add MongoDB: `railway add`
5. Set environment variables:
```bash
railway variables set JWT_SECRET=your-secret
railway variables set CORS_ORIGIN=your-frontend-url
```
6. Deploy: `railway up`

## Option 4: Vercel (Frontend) + Render/Railway (Backend)

### Frontend (Vercel)
1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variable:
   - `REACT_APP_API_URL`: Your backend URL
5. Deploy

### Backend (Render/Railway)
Follow Option 2 or 3 for backend

## Option 5: AWS/Azure/GCP

### Using Docker
1. Build images:
```bash
docker build -t secure-chat-backend ./backend
docker build -t secure-chat-frontend ./frontend
```

2. Push to container registry (ECR/ACR/GCR)
3. Deploy using ECS/AKS/GKE or App Service

## Environment Variables

### Backend
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: production
- `CORS_ORIGIN`: Frontend URL

### Frontend
- `REACT_APP_API_URL`: Backend API URL

## MongoDB Setup

### Option A: MongoDB Atlas (Recommended)
1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Use in `MONGODB_URI`

### Option B: Self-hosted
Use the MongoDB service in docker-compose.yml

## SSL/HTTPS

### With Docker + Nginx
Add Let's Encrypt SSL:
```bash
docker run -d -p 443:443 --name certbot certbot/certbot
```

### With Cloud Providers
Most platforms (Render, Vercel, Railway) provide automatic SSL

## Post-Deployment

1. Update CORS_ORIGIN in backend to match frontend URL
2. Update API URL in frontend to match backend URL
3. Generate strong JWT_SECRET: `openssl rand -base64 32`
4. Test registration and messaging
5. Monitor logs for errors

## Troubleshooting

- **CORS errors**: Check CORS_ORIGIN matches frontend URL
- **Database connection**: Verify MONGODB_URI is correct
- **Authentication issues**: Ensure JWT_SECRET is set
- **File uploads**: Check disk space and permissions
