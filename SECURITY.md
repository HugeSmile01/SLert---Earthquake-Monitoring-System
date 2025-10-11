# Security Notes

## Current Security Status

### Vulnerabilities (as of last check)
- **esbuild**: Moderate severity - Development dependency only, affects dev server
- **undici/firebase**: Moderate severity - Used in Firebase dependencies

### Recommendations
1. These vulnerabilities are in development dependencies and do not affect the production build
2. Monitor for updates and apply when available
3. Consider updating to newer versions when they become stable

### Best Practices Implemented
- ✅ No secrets in code
- ✅ Environment variables for sensitive data
- ✅ Input validation on forms
- ✅ CORS-aware API calls
- ✅ Local storage for non-sensitive data only
- ✅ HTTPS recommended for production
- ✅ CSP headers recommended

### Future Security Enhancements
1. Implement rate limiting for API calls
2. Add CAPTCHA for SMS subscriptions
3. Setup Sentry for error monitoring
4. Implement proper authentication with Firebase
5. Add API key rotation mechanism

## Reporting Security Issues
Please report security issues to the repository maintainers.
