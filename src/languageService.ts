/**
 * Language Service
 * Provides multilingual support for English and Filipino/Tagalog
 */

export type Language = 'en' | 'fil';

interface Translations {
  [key: string]: {
    en: string;
    fil: string;
  };
}

class LanguageService {
  private currentLanguage: Language = 'en';
  
  private translations: Translations = {
    // Navigation
    'nav.dashboard': { en: 'Dashboard', fil: 'Dashboard' },
    'nav.charts': { en: 'Charts', fil: 'Mga Tsart' },
    'nav.liveMap': { en: 'Live Map', fil: 'Live na Mapa' },
    'nav.alerts': { en: 'Alerts', fil: 'Mga Alerto' },
    'nav.community': { en: 'Community', fil: 'Komunidad' },
    'nav.safetyGuide': { en: 'Safety Guide', fil: 'Gabay sa Kaligtasan' },
    'nav.checkIn': { en: 'Check-In', fil: 'Mag-Check In' },
    'nav.admin': { en: 'Admin', fil: 'Admin' },
    
    // Dashboard
    'dashboard.last24h': { en: 'Last 24 Hours', fil: 'Huling 24 Oras' },
    'dashboard.last7days': { en: 'Last 7 Days', fil: 'Huling 7 Araw' },
    'dashboard.strongestToday': { en: 'Strongest Today', fil: 'Pinakamalakas Ngayong Araw' },
    'dashboard.alertsTriggered': { en: 'Alerts Triggered', fil: 'Mga Alerto na Naaktibo' },
    'dashboard.systemStatus': { en: 'System Status', fil: 'Status ng Sistema' },
    'dashboard.monitoringRegion': { en: 'Monitoring Region', fil: 'Rehiyong Minomonitor' },
    'dashboard.advancedStats': { en: 'Advanced Statistics', fil: 'Advanced na Estadistika' },
    
    // Statistics
    'stats.lastHour': { en: 'Last Hour', fil: 'Huling Oras' },
    'stats.last24h': { en: 'Last 24h', fil: 'Huling 24h' },
    'stats.last7days': { en: 'Last 7 Days', fil: 'Huling 7 Araw' },
    'stats.last30days': { en: 'Last 30 Days', fil: 'Huling 30 Araw' },
    'stats.magnitudeRange': { en: 'Magnitude Range', fil: 'Saklaw ng Magnitude' },
    'stats.activityTrend': { en: 'Activity Trend', fil: 'Kalakaran ng Aktibidad' },
    'stats.mostActiveArea': { en: 'Most Active Area', fil: 'Pinakaaktibong Lugar' },
    'stats.significantEvents': { en: 'Significant Events', fil: 'Mahahalagang Pangyayari' },
    'stats.criticalEvents': { en: 'Critical Events', fil: 'Kritikal na Pangyayari' },
    'stats.average': { en: 'Avg', fil: 'Ave' },
    'stats.trend.increasing': { en: 'Increasing', fil: 'Tumataas' },
    'stats.trend.decreasing': { en: 'Decreasing', fil: 'Bumababa' },
    'stats.trend.stable': { en: 'Stable', fil: 'Matatag' },
    
    // Earthquakes
    'eq.recentEarthquakes': { en: 'Recent Earthquakes', fil: 'Kamakailang Lindol' },
    'eq.refresh': { en: 'Refresh', fil: 'I-refresh' },
    'eq.magnitude': { en: 'Magnitude', fil: 'Magnitude' },
    'eq.depth': { en: 'Depth', fil: 'Lalim' },
    'eq.location': { en: 'Location', fil: 'Lokasyon' },
    'eq.time': { en: 'Time', fil: 'Oras' },
    'eq.felt': { en: 'felt reports', fil: 'nakaramdam' },
    'eq.deep': { en: 'km deep', fil: 'km ang lalim' },
    'eq.intensity': { en: 'Intensity', fil: 'Intensidad' },
    'eq.editedByAdmin': { en: 'Edited by Admin', fil: 'In-edit ng Admin' },
    
    // Filters
    'filter.minMagnitude': { en: 'Min Magnitude', fil: 'Minimum na Magnitude' },
    'filter.maxMagnitude': { en: 'Max Magnitude', fil: 'Maximum na Magnitude' },
    'filter.searchLocation': { en: 'Search Location', fil: 'Maghanap ng Lokasyon' },
    'filter.exportCSV': { en: 'Export CSV', fil: 'I-export ang CSV' },
    'filter.exportJSON': { en: 'Export JSON', fil: 'I-export ang JSON' },
    'filter.enableNotifications': { en: 'Enable Notifications', fil: 'Paganahin ang Notipikasyon' },
    'filter.sortBy': { en: 'Sort by', fil: 'Ayusin ayon sa' },
    
    // Safety Guide
    'safety.title': { en: 'Earthquake Safety Guide', fil: 'Gabay sa Kaligtasan sa Lindol' },
    'safety.before': { en: 'Before an Earthquake', fil: 'Bago ang Lindol' },
    'safety.during': { en: 'During an Earthquake', fil: 'Habang may Lindol' },
    'safety.after': { en: 'After an Earthquake', fil: 'Pagkatapos ng Lindol' },
    'safety.emergencyContacts': { en: 'Emergency Contacts', fil: 'Mga Emergency Contact' },
    'safety.intensityScale': { en: 'PHIVOLCS Earthquake Intensity Scale (PEIS)', fil: 'PHIVOLCS Intensity Scale para sa Lindol (PEIS)' },
    
    // Before earthquake
    'safety.before.1': { en: 'Secure heavy furniture and appliances', fil: 'Siguraduhing nakaayos ang mabibigat na kasangkapan' },
    'safety.before.2': { en: 'Prepare an emergency kit', fil: 'Maghanda ng emergency kit' },
    'safety.before.3': { en: 'Know your evacuation routes', fil: 'Alamin ang iyong evacuation route' },
    'safety.before.4': { en: 'Conduct earthquake drills', fil: 'Magsagawa ng earthquake drill' },
    
    // During earthquake
    'safety.during.1': { en: 'DROP, COVER, and HOLD ON', fil: 'YUMUKO, MAGTAKIP, at HUMAWAK' },
    'safety.during.2': { en: 'Stay away from windows', fil: 'Lumayo sa mga bintana' },
    'safety.during.3': { en: 'If outdoors, move to open area', fil: 'Kung nasa labas, lumipat sa lugar na walang hadlang' },
    'safety.during.4': { en: 'If driving, pull over safely', fil: 'Kung nagmamaneho, huminto nang ligtas' },
    
    // After earthquake
    'safety.after.1': { en: 'Check for injuries and hazards', fil: 'Tingnan kung may mga sugat at panganib' },
    'safety.after.2': { en: 'Expect aftershocks', fil: 'Asahan ang mga aftershock' },
    'safety.after.3': { en: 'Listen to emergency broadcasts', fil: 'Makinig sa mga emergency broadcast' },
    'safety.after.4': { en: 'Use check-in feature above', fil: 'Gamitin ang check-in feature sa itaas' },
    
    // Community
    'community.title': { en: 'Community News', fil: 'Balita ng Komunidad' },
    'community.donate': { en: 'Donate', fil: 'Mag-donate' },
    'community.postsRemaining': { en: 'posts remaining today', fil: 'natitirang post ngayong araw' },
    'community.postNews': { en: 'Post News', fil: 'Mag-post ng Balita' },
    'community.placeholder': { en: 'Share earthquake updates, safety tips, or community news... (10-500 characters)', fil: 'Magbahagi ng updates tungkol sa lindol, safety tips, o balita ng komunidad... (10-500 characters)' },
    'community.checkIn': { en: "I'm Safe!", fil: 'Ligtas ako!' },
    'community.checkInTitle': { en: 'Community Check-In', fil: 'Community Check-In' },
    'community.checkInDesc': { en: "Let others know you're safe after an earthquake.", fil: 'Ipaalam sa iba na ikaw ay ligtas pagkatapos ng lindol.' },
    
    // Alerts
    'alerts.title': { en: 'Alert Settings', fil: 'Mga Setting ng Alerto' },
    'alerts.description': { en: 'Configure instant alerts for earthquakes in your area.', fil: 'Isaayos ang instant na alerto para sa lindol sa iyong lugar.' },
    'alerts.threshold': { en: 'Alert Threshold (Magnitude)', fil: 'Threshold ng Alerto (Magnitude)' },
    'alerts.location': { en: 'Your Location in Southern Leyte', fil: 'Iyong Lokasyon sa Southern Leyte' },
    'alerts.subscribe': { en: 'Subscribe to Alerts', fil: 'Mag-subscribe sa Alerto' },
    'alerts.allDetected': { en: 'and above (All detected)', fil: 'pataas (Lahat ng nakita)' },
    'alerts.moderate': { en: 'and above (Moderate)', fil: 'pataas (Katamtaman)' },
    'alerts.strong': { en: 'and above (Strong)', fil: 'pataas (Malakas)' },
    'alerts.major': { en: 'and above (Major)', fil: 'pataas (Napakalakas)' },
    
    // Emergency Shelters
    'shelter.title': { en: 'Emergency Shelters', fil: 'Mga Emergency Shelter' },
    'shelter.findNearest': { en: 'Find Nearest Shelters', fil: 'Maghanap ng Pinakamalapit na Shelter' },
    'shelter.capacity': { en: 'Capacity', fil: 'Kapasidad' },
    'shelter.facilities': { en: 'Facilities', fil: 'Mga Pasilidad' },
    'shelter.showOnMap': { en: 'Show on Map', fil: 'Ipakita sa Mapa' },
    'shelter.away': { en: 'km away', fil: 'km ang layo' },
    
    // Common
    'common.loading': { en: 'Loading...', fil: 'Kumakarga...' },
    'common.noData': { en: 'No data available', fil: 'Walang available na data' },
    'common.error': { en: 'Error', fil: 'Mali' },
    'common.success': { en: 'Success', fil: 'Matagumpay' },
    'common.close': { en: 'Close', fil: 'Isara' },
    'common.cancel': { en: 'Cancel', fil: 'Kanselahin' },
    'common.confirm': { en: 'Confirm', fil: 'Kumpirmahin' },
    'common.or': { en: 'or', fil: 'o' },
    'common.and': { en: 'and', fil: 'at' },
  };

  constructor() {
    // Load saved language preference
    const saved = localStorage.getItem('preferred_language');
    if (saved === 'en' || saved === 'fil') {
      this.currentLanguage = saved;
    }
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * Set current language
   */
  setLanguage(lang: Language): void {
    this.currentLanguage = lang;
    localStorage.setItem('preferred_language', lang);
    
    // Dispatch event for language change
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));
  }

  /**
   * Translate a key
   */
  translate(key: string): string {
    const translation = this.translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[this.currentLanguage] || translation.en;
  }

  /**
   * Short alias for translate
   */
  t(key: string): string {
    return this.translate(key);
  }

  /**
   * Get language selector HTML
   */
  getLanguageSelectorHTML(): string {
    return `
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-600 dark:text-gray-400">Language:</label>
        <select id="language-selector" 
                class="border dark:border-gray-600 rounded px-3 py-1 dark:bg-gray-700 dark:text-white text-sm">
          <option value="en" ${this.currentLanguage === 'en' ? 'selected' : ''}>
            🇬🇧 English
          </option>
          <option value="fil" ${this.currentLanguage === 'fil' ? 'selected' : ''}>
            🇵🇭 Filipino
          </option>
        </select>
      </div>
    `;
  }

  /**
   * Initialize language selector
   */
  initLanguageSelector(): void {
    const selector = document.getElementById('language-selector') as HTMLSelectElement;
    if (!selector) return;

    selector.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      const lang = target.value as Language;
      this.setLanguage(lang);
    });
  }
}

export const languageService = new LanguageService();
