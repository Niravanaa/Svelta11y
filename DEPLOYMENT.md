# Vercel Deployment Guide for WCAG Scanner

This guide will help you set up per-branch deployments on Vercel for the WCAG Scanner project.

## Prerequisites

1. A [Vercel account](https://vercel.com/)
2. A GitHub repository for your project
3. Vercel CLI installed globally: `npm install -g vercel`

## Step 1: Initial Vercel Setup

1. **Link your project to Vercel:**

   ```bash
   vercel login
   vercel link
   ```

2. **Follow the prompts:**
   - Link to existing project? No
   - What's your project's name? `wcag-scanner`
   - In which directory is your code located? `./`

3. **Deploy for the first time:**
   ```bash
   vercel --prod
   ```

## Step 2: Configure GitHub Secrets

To enable automatic deployments via GitHub Actions, you need to add these secrets to your GitHub repository:

### Required Secrets

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:

**VERCEL_TOKEN:**

- Go to [Vercel Dashboard → Settings → Tokens](https://vercel.com/account/tokens)
- Create a new token with appropriate scope
- Copy the token value

**VERCEL_ORG_ID:**

- Run `vercel --cwd . --scope=YOUR_TEAM_SLUG` (replace with your team slug)
- Or find it in your `.vercel/project.json` file after linking

**VERCEL_PROJECT_ID:**

- Found in your `.vercel/project.json` file after linking the project
- Or get it from Vercel Dashboard → Project Settings

## Step 3: Per-Branch Deployment Configuration

### Automatic Branch Deployments

Vercel automatically creates preview deployments for:

- All branches (except main/master)
- Pull requests

### Branch-specific Environment Variables

You can set different environment variables for different branches:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables with specific branch targeting:
   - **Production:** Only main/master branch
   - **Preview:** All other branches
   - **Development:** Local development

## Step 4: Custom Domain Setup (Optional)

1. **Add custom domain:**

   ```bash
   vercel domains add your-domain.com
   ```

2. **Configure DNS:**
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or add A record pointing to Vercel's IP

3. **Branch-specific subdomains:**
   - Production: `your-domain.com`
   - Staging: `staging.your-domain.com`
   - Feature branches: Auto-generated URLs

## Step 5: Environment Variables Setup

Create environment variables in Vercel Dashboard for different environments:

### Production Environment

```env
NODE_ENV=production
# Add your production-specific variables here
```

### Preview Environment

```env
NODE_ENV=development
# Add your preview-specific variables here
```

## Deployment Workflow

### Automatic Deployments

1. **Production (main branch):**
   - Push to `main` branch
   - Runs tests and linting
   - Deploys to production domain

2. **Preview (feature branches):**
   - Push to any other branch
   - Creates preview deployment
   - Comments on PR with preview URL

3. **Pull Requests:**
   - Automatic preview deployments
   - Updated on every commit
   - Unique URL for each PR

### Manual Deployments

```bash
# Deploy current branch to preview
vercel

# Deploy to production
vercel --prod

# Deploy specific branch
vercel --prod --git-branch=main
```

## Advanced Configuration

### Custom Build Command

The project is configured to use:

```json
{
	"buildCommand": "npm run build",
	"framework": "sveltekit"
}
```

**Note:** Function runtimes are automatically configured by the SvelteKit Vercel adapter. You don't need to manually specify them in `vercel.json`.

### Edge Runtime (Optional)

For better performance, you can enable edge runtime in `svelte.config.js`:

```javascript
adapter: adapter({
	runtime: 'edge'
});
```

### ISR (Incremental Static Regeneration)

Already configured for static page caching:

```javascript
adapter: adapter({
	isr: {
		expiration: 3600 // 1 hour
	}
});
```

## Monitoring and Analytics

1. **Vercel Analytics:**
   - Enable in Vercel Dashboard → Analytics
   - Add environment variable: `VERCEL_ANALYTICS_ID`

2. **Function Logs:**
   - View in Vercel Dashboard → Functions
   - Real-time logs for API routes

3. **Performance Monitoring:**
   - Built-in Core Web Vitals
   - Runtime and build performance metrics

## Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check build logs in Vercel Dashboard
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript compilation

2. **Function Timeouts:**
   - Vercel has a 10s timeout for Hobby plan
   - Optimize API routes for performance
   - Consider upgrading to Pro plan

3. **Environment Variables:**
   - Ensure variables are set for correct environment
   - Check variable names match exactly
   - Redeploy after changing variables

### Getting Help

- [Vercel Documentation](https://vercel.com/docs)
- [SvelteKit on Vercel](https://vercel.com/docs/frameworks/sveltekit)
- [GitHub Actions with Vercel](https://vercel.com/guides/how-can-i-use-github-actions-with-vercel)

## Next Steps

1. Push your changes to GitHub
2. Set up the required GitHub secrets
3. Create a test branch to verify preview deployments
4. Configure custom domains if needed
5. Set up environment variables for different environments

Your WCAG Scanner will now have:

- ✅ Automatic production deployments from main branch
- ✅ Preview deployments for all feature branches
- ✅ PR comments with preview URLs
- ✅ Integrated CI/CD with testing and linting
- ✅ Per-branch environment variable support

## Windows Development Notes

If you're developing on Windows, you might encounter symlink permission issues when building locally. This is normal and won't affect your Vercel deployments. The builds will work correctly on Vercel's Linux environment.

**Local Windows Workarounds:**

1. Run PowerShell/CMD as Administrator when building
2. Use WSL2 for development (recommended)
3. Build will work normally on CI/CD and Vercel
