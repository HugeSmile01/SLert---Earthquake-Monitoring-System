# 🌏 Southern Leyte Earthquake Alert System

A comprehensive, real-time earthquake monitoring and alert system specifically designed for Southern Leyte, Philippines. This Progressive Web Application provides live earthquake data, email alerts with infographics, interactive maps, community check-in features, and educational resources to help keep the people of Southern Leyte safe.

![System Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![PWA Ready](https://img.shields.io/badge/PWA-ready-purple)

## 🚀 Features

### Core Features
- **Real-time Earthquake Monitoring** - Live data from USGS API filtered for Southern Leyte region
- **Interactive Map Visualization** - Leaflet.js powered map showing earthquake locations and magnitudes
- **Email Alert System** - Automatic email notifications with infographics for significant earthquakes
- **Progressive Web App** - Install as a mobile app with offline capability
- **Community Check-In** - Let friends and family know you're safe after an earthquake
- **Educational Resources** - Comprehensive earthquake preparedness and safety guides
- **Historical Data** - View and analyze past earthquake records
- **Responsive Design** - Mobile-first design works perfectly on all devices
- **Enhanced Security** - Input validation, rate limiting, and CSP headers
- **Reliable Data Fetching** - Automatic retry logic for API failures

### Dashboard Statistics
- Earthquakes in last 24 hours
- Earthquakes in last 7 days
- Strongest earthquake today
- Email alerts sent count
- System status indicators

## 🛠️ Technology Stack

- **Frontend:** TypeScript, HTML5, Tailwind CSS
- **Build Tool:** Vite
- **Maps:** Leaflet.js with OpenStreetMap
- **Data Source:** USGS Earthquake API
- **Email Service:** Ready for integration with email providers
- **PWA Features:** Service Worker, Web App Manifest
- **Security:** Input validation, rate limiting, CSP headers
- **Backend (Future):** Firebase (Authentication, Firestore, Cloud Functions)

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Modern web browser

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HugeSmile01/EarthquakeSys.git
   cd EarthquakeSys
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

## 🏗️ Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment.

## 📱 Email Alert Configuration

The system is ready for email integration with various email service providers.

**⚠️ IMPORTANT:** For production use, email sending MUST be implemented server-side. Never expose API keys in the client-side code.

### To Enable Email Alerts:

1. **Set up a backend API server** (Required for production):
   - Create a Node.js/Express backend or serverless function
   - Store API keys securely on the server
   - Implement email sending endpoints

2. **Choose an email service provider:**
   - **SendGrid:** https://sendgrid.com/
   - **Mailgun:** https://www.mailgun.com/
   - **Amazon SES:** https://aws.amazon.com/ses/

3. **Example Backend Implementation** (Node.js/Express):
   ```javascript
   // server.js
   const express = require('express');
   const sgMail = require('@sendgrid/mail');
   
   sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Server-side only!
   
   app.post('/api/subscribe', async (req, res) => {
     const { email, threshold, location } = req.body;
     
     // Validate inputs server-side
     // Store in database
     // Send confirmation email
     
     const msg = {
       to: email,
       from: 'alerts@southernleyte-earthquake.ph',
       subject: 'Earthquake Alert Subscription Confirmed',
       html: `<p>You're subscribed to alerts for ${location}</p>`
     };
     
     await sgMail.send(msg);
     res.json({ success: true });
   });
   ```

4. **Update the frontend** to call your backend API:
   ```typescript
   // In emailService.ts, replace the subscribeEmail method:
   const response = await fetch('/api/subscribe', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ email, threshold, location })
   });
   ```

5. **Environment variables (server-side only):**
   ```env
   SENDGRID_API_KEY=your_api_key
   EMAIL_FROM=alerts@your-domain.com
   DATABASE_URL=your_database_url
   ```

**Current Implementation:** The frontend currently stores subscriptions locally for demonstration. For production, implement a proper backend.

## 🔥 Firebase Integration (Optional)

For advanced features like user authentication and persistent data storage:

1. **Create a Firebase project** at https://console.firebase.google.com/

2. **Enable services:**
   - Authentication
   - Firestore Database
   - Cloud Functions

3. **Update Firebase configuration** in `src/firebase.ts`:
   ```typescript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     storageBucket: "your-storage-bucket",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

4. **Uncomment Firebase initialization code** in the same file

## 📊 API Data Sources

### Primary Data Source: USGS Earthquake API
- **Endpoint:** `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson`
- **Update Frequency:** Every 60 seconds
- **Geographic Filter:** Philippines region (4.5°N-21°N, 116°E-127°E)

### Alternative/Backup Source: PHIVOLCS
- Website: https://www.phivolcs.dost.gov.ph/
- Note: PHIVOLCS doesn't provide a public API, but this system can be extended to scrape their data

## 🎨 Customization

### Modify Alert Thresholds
Edit `src/earthquakeService.ts`:
```typescript
getMagnitudeColor(magnitude: number): string {
  if (magnitude >= 7.0) return '#dc2626'; // Major - Red
  if (magnitude >= 5.5) return '#f97316'; // Strong - Orange
  if (magnitude >= 4.0) return '#facc15'; // Moderate - Yellow
  return '#16a34a'; // Minor - Green
}
```

### Update Map Center and Zoom for Southern Leyte
Edit `src/mapService.ts`:
```typescript
this.map = L.map(containerId).setView([10.3, 125.0], 10);
```

### Customize Earthquake Bounds
Edit `src/earthquakeService.ts`:
```typescript
const SOUTHERN_LEYTE_BOUNDS = {
  minLat: 9.8,
  maxLat: 10.8,
  minLng: 124.5,
  maxLng: 125.5,
};
```

### Customize Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  'phivolcs-blue': '#003366',
  'alert-red': '#dc2626',
  'warning-yellow': '#facc15',
  'safe-green': '#16a34a',
}
```

## 📱 Progressive Web App (PWA)

The application is a fully functional PWA with:
- **Offline Support:** Service worker caches essential resources
- **Installable:** Add to home screen on mobile devices
- **App-like Experience:** Standalone display mode
- **Fast Loading:** Cached resources load instantly

### Installing the PWA:
1. Open the app in a mobile browser
2. Tap the "Add to Home Screen" option
3. The app will be installed like a native app

## 🔒 Security Features

- **Input Validation:** All user inputs are validated and sanitized
- **Rate Limiting:** Prevents abuse of subscription features
- **CSP Headers:** Content Security Policy prevents XSS attacks
- **HTTPS Enforcement:** Redirects to secure connection
- **Local Data Only:** Sensitive data stays on device

## 🛡️ Reliability Features

- **Automatic Retries:** Failed API calls retry with exponential backoff
- **Data Caching:** Earthquake data cached for offline access
- **Graceful Degradation:** App works even when API is unavailable
- **Error Boundaries:** Errors don't crash the entire application

## 🧪 Testing

Currently, the application doesn't have automated tests. To add testing:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Then create test files alongside your source files.

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### GitHub Pages
```bash
npm run build
# Push dist/ folder to gh-pages branch
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Emergency Contacts

- **NDRRMC:** 911
- **PHIVOLCS:** (02) 8426-1468 to 79
- **Red Cross:** 143
- **PAGASA:** (02) 8927-1335

## 🔐 Security

- Never commit API keys or secrets to the repository
- Use environment variables for sensitive configuration
- The application doesn't collect personal data by default
- Email subscriptions are stored locally (implement proper backend for production)
- Map marker icons are bundled locally (no external CDN dependencies)
- See [SECURITY.md](./SECURITY.md) for more details

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **USGS** - For providing free earthquake data API
- **PHIVOLCS** - Philippine Institute of Volcanology and Seismology
- **OpenStreetMap** - For map tiles
- **Leaflet.js** - For map visualization
- All contributors and users of this system

## 📧 Contact

For questions, suggestions, or support:
- Create an issue on GitHub
- Focus Area: Southern Leyte, Philippines

## ⚠️ Disclaimer

This system is designed to complement official government alerts and should not be relied upon as the sole source of earthquake information. Always follow official guidance from PHIVOLCS and local authorities during emergencies.

---

**Made with ❤️ for the safety of the people of Southern Leyte**