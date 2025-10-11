# 🌏 Philippine Earthquake Alert System (EarthquakeSys)

A comprehensive, real-time earthquake monitoring and alert system specifically designed for the Philippines. This web application provides live earthquake data, SMS alerts, interactive maps, community check-in features, and educational resources to help keep Filipinos safe.

![System Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🚀 Features

### Core Features
- **Real-time Earthquake Monitoring** - Live data from USGS API filtered for Philippines region
- **Interactive Map Visualization** - Leaflet.js powered map showing earthquake locations and magnitudes
- **SMS Alert System** - Automatic notifications for significant earthquakes (configurable threshold)
- **Community Check-In** - Let friends and family know you're safe after an earthquake
- **Educational Resources** - Comprehensive earthquake preparedness and safety guides
- **Historical Data** - View and analyze past earthquake records
- **Responsive Design** - Mobile-first design works perfectly on all devices

### Dashboard Statistics
- Earthquakes in last 24 hours
- Earthquakes in last 7 days
- Strongest earthquake today
- SMS alerts sent count
- System status indicators

## 🛠️ Technology Stack

- **Frontend:** TypeScript, HTML5, Tailwind CSS
- **Build Tool:** Vite
- **Maps:** Leaflet.js with OpenStreetMap
- **Data Source:** USGS Earthquake API
- **SMS Service:** Ready for Twilio or Semaphore integration
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

## 📱 SMS Alert Configuration

The system is ready for SMS integration with Twilio or Semaphore (Philippine SMS provider).

### To Enable SMS Alerts:

1. **Sign up for an SMS service:**
   - **Twilio:** https://www.twilio.com/
   - **Semaphore:** https://semaphore.co/ (Philippine provider)

2. **Update the alert service** in `src/alertService.ts`:
   ```typescript
   // Replace the simulateSMSAlert method with actual API calls
   import twilio from 'twilio';
   
   const client = twilio(accountSid, authToken);
   
   await client.messages.create({
     body: `EARTHQUAKE ALERT: M${earthquake.magnitude} detected ${earthquake.place}`,
     to: phoneNumber,
     from: twilioNumber
   });
   ```

3. **Configure environment variables:**
   Create a `.env` file:
   ```
   VITE_TWILIO_ACCOUNT_SID=your_account_sid
   VITE_TWILIO_AUTH_TOKEN=your_auth_token
   VITE_TWILIO_PHONE_NUMBER=your_twilio_number
   ```

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

### Update Map Center and Zoom
Edit `src/mapService.ts`:
```typescript
// Change initial map view
this.map = L.map(containerId).setView([12.8797, 121.7740], 6);
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

## 📱 Mobile App Development

The responsive web design works well on mobile browsers. To create native apps:

### Progressive Web App (PWA)
Add a service worker and manifest.json for offline functionality and app-like experience.

### React Native Conversion
The TypeScript codebase can be adapted for React Native to create native iOS/Android apps.

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
- SMS subscriptions are stored locally (implement proper backend for production)

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
- Email: [Your contact email]

## ⚠️ Disclaimer

This system is designed to complement official government alerts and should not be relied upon as the sole source of earthquake information. Always follow official guidance from PHIVOLCS and local authorities during emergencies.

---

**Made with ❤️ for the safety of the Filipino people**