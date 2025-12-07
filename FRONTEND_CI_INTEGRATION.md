# Frontend CI/CD Integration Summary

## Changes Made

### 1. Updated CI/CD Workflow (`.github/workflows/test-and-deploy.yml`)

Added a new `build-frontend` job that:
- Runs on every push and pull request
- Installs frontend dependencies from `web/package.json`
- Builds the frontend using `npm run build`
- Uploads the built artifacts (`web/dist`) for use in deployment

### 2. Updated Deployment Jobs

Both `deploy-staging` and `deploy-production` jobs now:
- Depend on both `build-check` and `build-frontend` jobs
- Download the frontend build artifacts before deploying
- Include the pre-built frontend in the Docker deployment

### 3. Optimized Dockerfile

Updated the Dockerfile to:
- Remove the frontend build steps (previously built in Docker)
- Use the pre-built frontend from CI artifacts
- Faster deployments since frontend is already built

## How It Works

### CI Pipeline Flow

```
Push to Branch
    ↓
┌─────────────────┬──────────────────┐
│  build-check    │  build-frontend  │
│  (Backend)      │  (Frontend)      │
└────────┬────────┴────────┬─────────┘
         │                 │
         └────────┬────────┘
                  ↓
         deploy-staging/production
         (Downloads frontend artifacts)
                  ↓
         Docker Build & Deploy to Fly.io
```

### Build Process

1. **Frontend Build Job**: 
   - Checks out code
   - Sets up Node.js 18
   - Runs `npm ci` in `web/` directory
   - Runs `npm run build` to create production build
   - Uploads `web/dist` as GitHub artifact (retained for 7 days)

2. **Deployment Jobs**:
   - Download the frontend build artifact
   - Copy it to `web/dist` directory
   - Docker build copies this into the image
   - Deploy to Fly.io (staging or production)

### Benefits

✅ **Faster Deployments**: Frontend is built once in CI, not rebuilt in Docker  
✅ **Better Caching**: npm cache is utilized in CI  
✅ **Parallel Builds**: Frontend and backend checks run simultaneously  
✅ **Artifact Retention**: Build artifacts available for debugging  
✅ **Consistent Builds**: Same build used across all deployment stages

## Deployment Triggers

- **Staging**: Push to `develop` branch
- **Production**: Push to `main` branch

## Testing Locally

To test the frontend build locally:

```bash
cd web
npm install
npm run build
```

The built files will be in `web/dist/` directory.

## Environment Variables

The backend serves the frontend using the `WEB_BUILD_PATH` environment variable:
- Set in Dockerfile: `ENV WEB_BUILD_PATH=/app/web/dist`
- Backend serves static files from this path

## Notes

- The `web/dist` directory is gitignored (as it should be)
- CI builds are fresh on every run
- Artifacts are automatically cleaned up after 7 days
- The backend already has express.static configured to serve the frontend
