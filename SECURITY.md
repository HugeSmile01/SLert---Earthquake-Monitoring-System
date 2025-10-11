# Security Notes

## Current Security Status

### Security Features Implemented
- ✅ Input validation and sanitization
- ✅ Email validation with regex
- ✅ Rate limiting for subscriptions (5 attempts per minute)
- ✅ Content Security Policy (CSP) headers
- ✅ HTTPS enforcement utility
- ✅ XSS prevention through input sanitization
- ✅ No secrets in code
- ✅ Environment variables for sensitive data
- ✅ CORS-aware API calls
- ✅ Local storage for non-sensitive data only
- ✅ Local bundling of map marker assets

### Vulnerabilities (as of last check)
- **esbuild**: Moderate severity - Development dependency only, affects dev server
- **undici/firebase**: Moderate severity - Used in Firebase dependencies

### Recommendations
1. These vulnerabilities are in development dependencies and do not affect the production build
2. Monitor for updates and apply when available
3. Consider updating to newer versions when they become stable

### Security Features Details

#### Input Validation
All user inputs are validated and sanitized using the SecurityUtils class:
- Email addresses validated with proper regex
- Location names sanitized to prevent XSS
- Maximum input lengths enforced

#### Rate Limiting
Subscription attempts are rate-limited to prevent abuse:
- Maximum 5 attempts per minute per feature
- Tracked using localStorage with timestamps
- Automatic cleanup of old attempts

#### Content Security Policy
CSP headers configured to restrict:
- Script sources to self and trusted CDNs
- Style sources to self and trusted CDNs
- Image sources to self, data URLs, and OpenStreetMap
- API connections to USGS only
- No frame embedding allowed

### Future Security Enhancements
1. Implement server-side rate limiting
2. Add CAPTCHA for email subscriptions
3. Setup Sentry for error monitoring
4. Implement proper authentication with Firebase
5. Add API key rotation mechanism
6. Add email verification for subscriptions

## Reporting Security Issues
Please report security issues to the repository maintainers.
