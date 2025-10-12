# 🌏 Southern Leyte Earthquake Alert System

A comprehensive, real-time earthquake monitoring and alert system specifically designed for Southern Leyte, Philippines. This Progressive Web Application provides live earthquake data from USGS API, instant alerts using SweetAlert2, interactive maps, community check-in features, and educational resources.

**Developer:** John Rish Ladica - Southern Leyte, Philippines

**⚠️ Important Disclaimer:** This is an independent system created by a developer from Southern Leyte. It is NOT an official government system. The system uses publicly available APIs (USGS Earthquake API) to fetch earthquake data. Any inaccuracies in the data are from the source API, not from this system. Always follow official government alerts and guidelines from PHIVOLCS and NDRRMC.

![System Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![PWA Ready](https://img.shields.io/badge/PWA-ready-purple)

## 🚀 Features

### Core Features
- **Real-time Earthquake Monitoring** - Live data from USGS API filtered for Southern Leyte region
- **Interactive Map Visualization** - Leaflet.js powered map showing earthquake locations and magnitudes
- **SweetAlert2 Notifications** - Beautiful, user-friendly alerts for significant earthquakes
- **Firebase Integration** - Ready for real-time data storage and push notifications
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
- Alerts triggered count
- System status indicators

## 🛠️ Technology Stack

- **Frontend:** TypeScript, HTML5, Tailwind CSS
- **Build Tool:** Vite
- **Maps:** Leaflet.js with OpenStreetMap
- **Data Source:** USGS Earthquake API
- **Alerts:** SweetAlert2 for beautiful notifications
- **PWA Features:** Service Worker, Web App Manifest
- **Security:** Input validation, rate limiting, CSP headers
- **Backend:** Firebase (Authentication, Firestore, Cloud Functions)

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

## 🔥 Firebase Integration

The system uses Firebase for real-time data storage and notifications. To enable Firebase:

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database
   - Enable Authentication (optional for user management)

2. **Configure Firebase:**
   - Copy `.env.example` to `.env` and add your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```
   
   - Or set these as environment variables in your deployment platform
   - For GitHub Actions, add these as repository secrets

3. **Firebase Initialization:**
   - Firebase is automatically initialized when valid credentials are provided
   - The system will use placeholder values if no credentials are configured
   - Check the console for "✅ Firebase initialized successfully" message

4. **Firestore Structure:**
   ```
   /alerts
     - magnitude: number
     - place: string
     - time: timestamp
     - location: string
   
   /subscriptions
     - threshold: number
     - location: string
     - userId: string (optional)
   ```

**Current Implementation:** The system stores data locally for demonstration. For production, implement proper Firebase integration.

## 📊 API Data Sources

### Primary Data Source: USGS Earthquake API
- **Endpoint:** `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson`
- **Update Frequency:** Every 60 seconds
- **Geographic Filter:** Philippines region (4.5°N-21°N, 116°E-127°E)
- **Note:** All earthquake data comes from USGS. Any inaccuracies are from the source API, not this application.

### Emergency Information Source
- **PHIVOLCS:** https://www.phivolcs.dost.gov.ph/ (Official Philippine seismology institute)
- **NDRRMC:** For disaster response coordination
- Always follow official government alerts and guidelines

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
- Alert subscriptions are stored locally (implement proper backend for production)
- Map marker icons are bundled locally (no external CDN dependencies)
- See [SECURITY.md](./SECURITY.md) for more details

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **USGS** - For providing free earthquake data API
- **OpenStreetMap** - For map tiles
- **Leaflet.js** - For map visualization
- **SweetAlert2** - For beautiful alert notifications
- **Firebase** - For backend infrastructure
- All contributors and users of this system

## 📧 Contact & Developer

**Developer:** John Rish Ladica  
**Location:** Southern Leyte, Philippines  
**Purpose:** Community earthquake monitoring and awareness

For questions, suggestions, or support:
- Create an issue on GitHub
- This is an independent project, not affiliated with any government agency

## ⚠️ Disclaimer

**IMPORTANT:** This is an independent system created by John Rish Ladica from Southern Leyte, Philippines. It is NOT an official government system.

- The system uses the USGS Earthquake API to fetch earthquake data
- Any inaccuracies in earthquake data are from the source API (USGS), not from this system
- This system is designed to complement official government alerts
- **Do NOT rely on this as the sole source of earthquake information**
- Always follow official guidance from PHIVOLCS, NDRRMC, and local authorities during emergencies
- The developer and this system are not responsible for any damages or losses resulting from the use of this application

---

**Made with ❤️ for the safety and awareness of the people of Southern Leyte**