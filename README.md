# 🌏 Philippines Earthquake Monitoring & Alert System

A comprehensive, real-time earthquake monitoring and alert system for the Philippines. Originally designed for Southern Leyte, now expanded to cover the entire Philippines archipelago. This Progressive Web Application provides live earthquake data from USGS API, instant alerts, interactive maps, emergency shelter locations, community features, and educational resources in both English and Filipino.

**Developer:** John Rish Ladica - Southern Leyte, Philippines

**⚠️ Important Disclaimer:** This is an independent system created by a developer from Southern Leyte. It is NOT an official government system. **For accurate and official earthquake information, always verify with [PHIVOLCS (Philippine Institute of Volcanology and Seismology)](https://earthquake.phivolcs.dost.gov.ph/)** - the authoritative source for earthquake data in the Philippines. The system uses publicly available APIs (USGS Earthquake API) to fetch earthquake data. Any inaccuracies in the data are from the source API, not from this system. Always follow official government alerts and guidelines from PHIVOLCS and NDRRMC.

![System Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![PWA Ready](https://img.shields.io/badge/PWA-ready-purple)
![Multilingual](https://img.shields.io/badge/languages-EN%20%7C%20FIL-blue)

## 🆕 What Makes This System More Useful

This system goes beyond basic earthquake monitoring with advanced features designed specifically for Filipino communities:

### ✨ Advanced Features Not Found in Basic Monitoring Sites:
- **🌐 Multi-Region Coverage** - Monitor any region in the Philippines, not just one area
- **📊 PHIVOLCS Intensity Scale** - See estimated intensity (I-X) with educational descriptions
- **🏕️ Emergency Shelter Locator** - Find nearest evacuation centers with contact info
- **🌏 Bilingual Interface** - Full support for English and Filipino/Tagalog
- **📈 Advanced Statistics** - Real-time trend analysis with hourly/daily/weekly counts
- **🗺️ Smart Region Selector** - Automatically adjusts map view for selected region
- **📱 Complete PWA** - Works offline with cached data
- **👥 Community Features** - User check-ins, reports, and news sharing
- **🔔 Smart Notifications** - Customizable alerts based on location and magnitude

## 🚀 Core Features

### Real-Time Monitoring
- **Live Earthquake Data** - Updates every 60 seconds from USGS API
- **Interactive Map** - Leaflet.js powered visualization with color-coded markers
- **Intensity Badges** - PHIVOLCS Earthquake Intensity Scale (PEIS) indicators
- **Auto-Refresh** - Continuous monitoring with automatic data updates
- **Regional Filtering** - Focus on specific provinces or view nationwide

### Multi-Region Support (NEW!)
Monitor earthquakes in any Philippine region:
- 📍 Southern Leyte (original, high seismic risk)
- 📍 Metro Manila / NCR (West Valley Fault zone)
- 📍 Mindanao Region (highly active seismic zone)
- 📍 Visayas Region (Central Philippines)
- 📍 Luzon Region (Northern Philippines)
- 📍 Philippines Nationwide (complete coverage)

Each region includes:
- Custom geographic bounds
- Seismic risk level indicators
- Optimized map zoom and centering
- Regional description and context

### Emergency Response Tools
- **🏕️ Shelter Locator** - Database of evacuation centers and emergency shelters
  - Detailed facility information
  - Contact numbers for emergencies
  - Capacity and amenities listing
  - "Show on Map" quick navigation
  - Filter by province/municipality
- **📞 Emergency Contacts** - Quick access to NDRRMC, PHIVOLCS, Red Cross
- **✅ Community Check-In** - Mark yourself safe after an earthquake
- **📱 Push Notifications** - Real-time alerts for significant events

### Data Visualization Features
- **Magnitude Trends Chart** - Track average and maximum magnitude over time
- **Frequency Distribution** - Bar chart showing earthquake count by magnitude range
- **Depth Analysis** - Scatter plot correlating earthquake depth with magnitude
- **Interactive Charts** - Powered by Chart.js with responsive design

### Filtering & Search Features
- **Advanced Filtering** - Filter earthquakes by magnitude range and location
- **Real-time Search** - Search earthquakes by location name
- **Sortable Data** - Sort by time, magnitude, depth, or location
- **Pagination** - Navigate through large datasets efficiently
- **Data Export** - Export filtered data as CSV or JSON

### User Interface Features
- **🌐 Bilingual Support** - Switch between English and Filipino/Tagalog
- **🌙 Dark Mode** - Toggle between light and dark themes with automatic persistence
- **📱 Responsive Design** - Optimized for mobile, tablet, and desktop
- **♿ Accessible** - ARIA labels and keyboard navigation support
- **🎨 Modern UI** - Clean, intuitive interface with Tailwind CSS
- **⚡ Fast Loading** - Optimized bundle sizes and lazy loading

### Advanced Statistics Dashboard (NEW!)
Real-time analytics and insights:
- **Hourly Activity** - Earthquakes in the last hour
- **24-Hour Summary** - Last day's seismic activity
- **Weekly Trends** - 7-day earthquake count
- **Monthly Overview** - 30-day historical data
- **Magnitude Analysis** - Min, max, and average magnitude
- **Activity Trends** - Increasing/Decreasing/Stable indicators with visual icons
- **Most Active Area** - Geographic hotspot identification
- **Significant Events** - Count of M ≥ 5.0 earthquakes
- **Critical Events** - Count of M ≥ 6.0 earthquakes
- **Beautiful Visualizations** - Gradient cards with color-coded data

### PHIVOLCS Intensity Scale Integration (NEW!)
Educational earthquake intensity information:
- **Intensity Badges** - Roman numeral (I-X) intensity indicators on all earthquakes
- **Effect Descriptions** - Detailed explanations of what to expect at each level
- **Color Coding** - Visual severity indicators (green to dark red)
- **Educational Guide** - Complete PEIS scale with examples
- **Estimated Calculations** - Automatic intensity estimation from magnitude and depth
- **Hover Details** - Tooltip information on intensity effects

### Dashboard Statistics
- Earthquakes in last hour (NEW!)
- Earthquakes in last 24 hours
- Earthquakes in last 7 days
- Strongest earthquake today
- Alerts triggered count
- System status indicators

### Community Features
- **Community News** - Share updates and information with the community (limited to 1-2 posts per day)
- **Heart/Like System** - Show support for community posts with heart reactions
- **Donation Feature** - Support system maintenance and affected communities
- **User Reports** - Submit earthquake experience reports with intensity ratings
- **Upvote/Downvote System** - Community verification of earthquake reports
- **Anonymous Comments** - Discussion threads for each earthquake event
- **Web Share API** - Share earthquake data to social media platforms

### Performance & Monitoring
- **Error Tracking** - Sentry.io integration for JavaScript error monitoring
- **Performance Monitoring** - Web Vitals API tracking (LCP, FID, CLS)
- **Real-time Metrics** - Monitor Core Web Vitals and API performance

### Admin Features
- **Admin Portal** - Professional management interface (restricted to admin@johnrish.website)
- **Magnitude Editing** - Update earthquake magnitudes with "edited by admin" labels
- **Content Moderation** - Delete inappropriate news posts, reports, and comments
- **Activity Dashboard** - Monitor community activity and system statistics
- **Edit History** - Track all administrative changes with timestamps and reasons

## 🛠️ Technology Stack

- **Frontend:** TypeScript, HTML5, Tailwind CSS
- **Build Tool:** Vite
- **Maps:** Leaflet.js with OpenStreetMap
- **Charts:** Chart.js for data visualization
- **Data Storage:** IndexedDB for local caching
- **Data Source:** USGS Earthquake API
- **Alerts:** SweetAlert2 for beautiful notifications
- **Browser Notifications:** Notification API for real-time alerts
- **PWA Features:** Service Worker, Web App Manifest
- **Security:** Input validation, rate limiting, CSP headers
- **Backend:** Firebase (Authentication, Firestore, Cloud Functions)
- **Error Tracking:** Sentry.io (optional)
- **Performance:** Web Vitals API
- **Sharing:** Web Share API

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
   
   /communityNews
     - userId: string
     - userName: string
     - content: string
     - timestamp: number
     - hearts: number
     - heartedBy: array of user IDs
   
   /earthquakeReports
     - earthquakeId: string
     - userId: string
     - userName: string
     - experience: string
     - intensity: number (1-10)
     - timestamp: number
     - upvotes: number
     - downvotes: number
     - votedBy: object {userId: 'up' | 'down'}
   
   /earthquakeComments
     - earthquakeId: string
     - userId: string
     - userName: string
     - content: string
     - timestamp: number
   
   /earthquakeEdits
     - earthquakeId: string
     - editedMagnitude: number
     - originalMagnitude: number (optional)
     - editedBy: string (admin email)
     - editedAt: number
     - reason: string
     - editedByAdmin: boolean
   ```

5. **Firebase Security Rules:**
   Configure Firestore security rules to protect data:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow read access to all documents
       match /{document=**} {
         allow read: if true;
       }
       
       // Community News - authenticated users only
       match /communityNews/{newsId} {
         allow create: if request.auth != null;
         allow update: if request.auth != null && 
                       (request.resource.data.hearts == resource.data.hearts + 1 ||
                        request.resource.data.hearts == resource.data.hearts - 1);
       }
       
       // Earthquake Reports - authenticated users only
       match /earthquakeReports/{reportId} {
         allow create: if request.auth != null;
         allow update: if request.auth != null;
       }
       
       // Comments - authenticated users only
       match /earthquakeComments/{commentId} {
         allow create: if request.auth != null;
         allow delete: if request.auth != null && 
                       resource.data.userId == request.auth.uid;
       }
       
       // Earthquake Edits - admin only
       match /earthquakeEdits/{editId} {
         allow write: if request.auth != null && 
                      request.auth.token.email == 'admin@johnrish.website';
       }
     }
   }
   ```

**Current Implementation:** The system stores data locally for demonstration. For production, implement proper Firebase integration.

## 🎯 Community Features Guide

### Community News
- Users can post 1-2 news updates per day
- Posts must be between 10-500 characters
- Users can "heart" posts to show support
- Anonymous authentication via Firebase

### Earthquake Reports
- Share your experience of an earthquake
- Rate intensity from 1-10
- Community can upvote/downvote for verification
- Helps build community-driven data

### Comments & Discussion
- Post anonymous comments on earthquake events
- Create discussion threads
- Delete your own comments
- Moderated by admin

### Donations
- Support system maintenance
- Help affected communities
- Contact admin for donation details

### Web Share API
- Share earthquake data to social media
- Generate shareable links
- Fallback to clipboard copy on unsupported browsers

## 🔐 Admin Portal

The admin portal is restricted to `admin@johnrish.website` only.

### Access Admin Portal
1. Navigate to `/admin.html`
2. Login with admin credentials
3. Access requires Firebase Authentication

### Admin Features
- **View Statistics:** Total news posts, reports, and comments
- **Edit Earthquake Magnitudes:** Update inaccurate API data with transparency labels
- **Moderate Content:** Delete inappropriate posts, reports, or comments
- **View Recent Activity:** Monitor all community interactions
- **Edit History:** Track all magnitude changes with reasons

### Setting Up Admin Account
1. In Firebase Console, go to Authentication
2. Add user with email: `admin@johnrish.website`
3. Set password
4. Admin will auto-detect email on login

## 📊 Error Tracking & Performance

### Sentry Integration (Optional)
1. Create account at [Sentry.io](https://sentry.io)
2. Get your DSN key
3. Add to `.env`:
   ```env
   VITE_SENTRY_DSN=your_sentry_dsn
   ```
4. Update Sentry script in `index.html` and `admin.html`
5. Errors will be automatically tracked

### Performance Monitoring
The system automatically tracks:
- **LCP (Largest Contentful Paint):** Page load performance
- **FID (First Input Delay):** Interactivity
- **CLS (Cumulative Layout Shift):** Visual stability
- **API Response Times:** Monitor earthquake data fetching

View metrics in browser console or implement custom dashboard.

## 📊 API Data Sources

### ⚠️ Official Authoritative Source: PHIVOLCS
- **PHIVOLCS:** https://earthquake.phivolcs.dost.gov.ph/ (Official Philippine seismology institute)
- **Contact:** (02) 8426-1468 to 79
- **ALWAYS verify earthquake information with PHIVOLCS for accuracy**
- PHIVOLCS is the official government agency responsible for earthquake monitoring in the Philippines

### Data Fetching Source: USGS Earthquake API
- **Endpoint:** `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson`
- **Update Frequency:** Every 60 seconds
- **Geographic Filter:** Philippines region (4.5°N-21°N, 116°E-127°E)
- **Note:** This system uses USGS API for data fetching, but all earthquake information should be verified with PHIVOLCS, the official Philippine authority.

### Emergency Information Source
- **NDRRMC:** For disaster response coordination
- Always follow official government alerts and guidelines from PHIVOLCS and NDRRMC

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
- **Offline Support:** Service worker caches essential resources and API data
- **Installable:** Add to home screen on mobile devices
- **App-like Experience:** Standalone display mode
- **Fast Loading:** Cached resources load instantly
- **Background Sync:** Automatic data updates when online

### Installing the PWA:
1. Open the app in a mobile browser
2. Tap the "Add to Home Screen" option
3. The app will be installed like a native app

## 🎯 Using the New Features

### Dark Mode
- Click the theme toggle button (🌙/☀️) in the navigation bar
- Theme preference is saved to localStorage
- Automatically adapts to system preferences on first visit

### Browser Notifications
1. Click the "🔔 Enable Notifications" button
2. Grant notification permission when prompted
3. Receive real-time alerts for earthquakes above your threshold
4. Notifications work even when the tab is not active

### Filtering & Search
- **Min/Max Magnitude:** Use sliders to filter earthquake magnitudes
- **Search:** Type location names to filter results
- **Sort:** Click column headers (Time, Magnitude, Depth, Location) to sort
- **Pagination:** Navigate through results using page buttons

### Data Export
- Click "📊 Export CSV" to download data as a spreadsheet
- Click "📄 Export JSON" to download data as JSON
- Exported data respects current filters

### Data Visualization
- View the **Charts** section for visual insights
- **Magnitude Trends:** Track changes over time
- **Frequency Distribution:** See earthquake distribution by magnitude
- **Depth Analysis:** Correlate depth with magnitude

### Offline Mode
- The app automatically caches earthquake data
- Works offline with last cached data
- Service worker caches API responses for 24 hours
- IndexedDB stores up to 30 days of earthquake history

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

- **PHIVOLCS** - Official Philippine Institute of Volcanology and Seismology - the authoritative source for earthquake information in the Philippines
- **USGS** - For providing free earthquake data API used for data fetching
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

- **For official and accurate earthquake information, ALWAYS verify with [PHIVOLCS](https://earthquake.phivolcs.dost.gov.ph/)** - the authoritative source
- The system uses the USGS Earthquake API to fetch earthquake data for display purposes only
- Any inaccuracies in earthquake data should be verified with PHIVOLCS, not this system
- This system is designed to complement official government alerts, not replace them
- **Do NOT rely on this as the sole source of earthquake information**
- Always follow official guidance from PHIVOLCS, NDRRMC, and local authorities during emergencies
- PHIVOLCS Contact: (02) 8426-1468 to 79
- The developer and this system are not responsible for any damages or losses resulting from the use of this application

---

**Made with ❤️ for the safety and awareness of the people of Southern Leyte**