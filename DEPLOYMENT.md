# Oxy Notes - Monorepo Deployment Guide

This monorepo contains both frontend and backend applications that can be deployed separately on Vercel.

## 🚀 Deployment Setup

### Frontend Deployment
1. **Create new Vercel project** for frontend
2. **Connect to repository** and select **root directory**
3. **Vercel will automatically detect** the `vercel.json` configuration
4. **Deploy** - the frontend will be built and deployed

**Configuration**: Uses root `vercel.json`
- **Build Command**: `cd packages/frontend && npm run build-web:prod`  
- **Output Directory**: `packages/frontend/dist`
- **Ignores**: Only rebuilds when frontend files change

### Backend Deployment  
1. **Create another Vercel project** for backend
2. **Connect to the same repository**
3. **Set Root Directory** to `packages/backend` in project settings
4. **Deploy** - the backend API will be deployed as serverless functions

**Configuration**: Uses `packages/backend/vercel.json`
- **Framework**: Node.js serverless functions
- **Entry Point**: `server.js`
- **Ignores**: Only rebuilds when backend files change

## 🔧 Local Development

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev

# Start individually
npm run frontend  # Frontend only
npm run backend   # Backend only

# Build for production
npm run build:web      # Frontend web build
npm run build:backend  # Backend build
```

## 📁 Project Structure

```
oxy-notes/
├── vercel.json                 # Frontend deployment config
├── packages/
│   ├── frontend/
│   │   ├── vercel.json        # Backup frontend config
│   │   └── ...
│   └── backend/
│       ├── vercel.json        # Backend deployment config
│       └── ...
```

## 🌐 URLs After Deployment

- **Frontend**: `https://your-frontend-app.vercel.app`
- **Backend API**: `https://your-backend-api.vercel.app`

## 🔄 Environment Variables

Remember to set environment variables in both Vercel projects:
- Frontend: API endpoints, public keys
- Backend: Database URLs, private keys, etc.
