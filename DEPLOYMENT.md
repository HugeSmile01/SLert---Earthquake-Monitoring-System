# Deployment Guide

## Overview
This guide covers deploying the Philippine Earthquake Alert System to various platforms.

## Prerequisites
- Node.js 18+ installed
- Git repository access
- Domain name (optional)

## Build for Production

```bash
npm install
npm run build
```

The production files will be in the `dist/` directory.

## Deployment Options

### 1. Vercel (Recommended)

**Why Vercel:**
- Zero configuration
- Automatic HTTPS
- Global CDN
- Instant deployments

**Steps:**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Production deployment
vercel --prod
```

**Configuration:**
Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### 2. Netlify

**Steps:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

**Configuration:**
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. GitHub Pages

**Steps:**
1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy to gh-pages:
   ```bash
   # Install gh-pages
   npm install -g gh-pages
   
   # Deploy
   gh-pages -d dist
   ```

3. Enable GitHub Pages in repository settings

**Add to package.json:**
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

### 4. Firebase Hosting

**Steps:**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Deploy
firebase deploy --only hosting
```

**firebase.json:**
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## Environment Variables

If using SMS or Firebase features, set these environment variables:

### For Twilio SMS:
```env
VITE_TWILIO_ACCOUNT_SID=your_account_sid
VITE_TWILIO_AUTH_TOKEN=your_auth_token
VITE_TWILIO_PHONE_NUMBER=your_phone_number
```

### For Firebase:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Post-Deployment

### 1. Update API Endpoints
If you have custom API endpoints, update them in:
- `src/earthquakeService.ts`
- `src/alertService.ts`

### 2. Configure SMS Service
Update `src/alertService.ts` with your Twilio/Semaphore credentials.

### 3. Test Features
- [ ] Dashboard loads correctly
- [ ] Map displays (check CORS for OpenStreetMap)
- [ ] Earthquake data fetches from USGS
- [ ] SMS subscription form works
- [ ] Check-in feature works
- [ ] Mobile responsiveness

### 4. Performance Optimization
```bash
# Analyze bundle size
npm run build -- --mode analyze

# Check lighthouse scores
npx lighthouse http://your-domain.com --view
```

## Monitoring

### Setup Monitoring Services:
1. **Google Analytics** - Add tracking code to `index.html`
2. **Sentry** - For error tracking
3. **Uptime Robot** - Monitor site availability

### Health Check Endpoint
The system status shows:
- PHIVOLCS API status
- SMS Service status
- Map Service status

## Troubleshooting

### Issue: Map tiles not loading
**Solution:** Check CORS settings and ensure OpenStreetMap tiles are accessible.

### Issue: USGS API blocked
**Solution:** The API should work without authentication. Check network connectivity and CORS.

### Issue: SMS not sending
**Solution:** Verify Twilio/Semaphore credentials and account balance.

### Issue: Build fails
**Solution:** 
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Security Checklist

- [ ] API keys stored in environment variables
- [ ] HTTPS enabled
- [ ] CSP headers configured
- [ ] No sensitive data in localStorage
- [ ] Input validation on forms
- [ ] Rate limiting for API calls

## Maintenance

### Regular Updates:
```bash
# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

### Data Source Monitoring:
- Monitor USGS API status
- Check for API changes
- Verify Philippines region data accuracy

## Custom Domain

### Vercel:
```bash
vercel domains add your-domain.com
```

### Netlify:
Add domain in Netlify dashboard under Domain Management.

### GitHub Pages:
Add CNAME file to repository:
```
your-domain.com
```

## Backup and Recovery

### Backup Important Data:
- Firebase data (if using)
- User subscriptions
- Check-in history
- Configuration files

### Recovery Plan:
1. Keep repository backed up
2. Document environment variables
3. Store API keys securely
4. Maintain deployment documentation

## Support

For deployment issues:
1. Check the GitHub Issues
2. Review deployment platform documentation
3. Contact the development team

---

**Last Updated:** 2025
