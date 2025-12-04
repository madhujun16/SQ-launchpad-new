# GitHub Pages Deployment Guide

## Setup Instructions

### Method 1: Automatic Deployment (Recommended)

1. **Enable GitHub Pages in Repository Settings:**
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**
   - Save

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Setup GitHub Pages deployment"
   git push origin main
   ```

3. **Deploy:**
   - The GitHub Actions workflow will automatically build and deploy on every push to `main`
   - Check the **Actions** tab in your repository to see deployment progress
   - Once deployed, your site will be available at:
     `https://madhujun16.github.io/SQ-launchpad-new/`

### Method 2: Manual Deployment (Using gh-pages)

1. **Build and deploy:**
   ```bash
   npm run deploy
   ```

2. **Enable GitHub Pages:**
   - Go to repository **Settings** → **Pages**
   - Under **Source**, select **gh-pages** branch
   - Save

## Configuration

### Base Path

The app is configured to use `/SQ-launchpad-new/` as the base path for GitHub Pages.

**To change the base path:**
- Edit `vite.config.ts` and update the `base` property
- Or set environment variable: `VITE_BASE_PATH=/your-path/`

**For custom domain (root deployment):**
- Set `base: '/'` in `vite.config.ts`
- Update your custom domain in GitHub Pages settings

### Environment Variables

If you need environment variables for production:
1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. Add your secrets (e.g., `VITE_API_BASE_URL`)
3. Update the workflow file to use them in the build step

## Troubleshooting

### 404 Errors on Routes
- Ensure `base` path in `vite.config.ts` matches your repository name
- Check that React Router is configured correctly

### Build Fails
- Check GitHub Actions logs
- Ensure all dependencies are in `package.json`
- Verify Node.js version (should be 20)

### Assets Not Loading
- Check that asset paths use relative URLs
- Verify `base` path is correct

## Custom Domain

To use a custom domain:
1. Set `base: '/'` in `vite.config.ts`
2. Add `CNAME` file in `public/` folder with your domain
3. Configure DNS settings in your domain provider
4. Update GitHub Pages settings with your custom domain

