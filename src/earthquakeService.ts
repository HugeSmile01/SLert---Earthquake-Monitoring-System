import type { Earthquake, EarthquakeResponse } from './types';
import { indexedDBService } from './indexedDBService';

/**
 * Earthquake Service
 * 
 * IMPORTANT: For accurate and official earthquake information, always verify with
 * PHIVOLCS (Philippine Institute of Volcanology and Seismology):
 * https://earthquake.phivolcs.dost.gov.ph/
 * Contact: (02) 8426-1468 to 79
 * 
 * This service uses USGS API for data fetching, but PHIVOLCS is the authoritative
 * source for earthquake data in the Philippines.
 */

const USGS_API_BASE = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary';
const SOUTHERN_LEYTE_BOUNDS = {
  minLat: 9.8,
  maxLat: 10.8,
  minLng: 124.5,
  maxLng: 125.5,
};

class EarthquakeService {
  private cachedData: Earthquake[] = [];
  private lastFetch: number = 0;
  private cacheDuration: number = 60000;
  private maxRetries: number = 3;
  private retryDelay: number = 2000;

  async fetchEarthquakes(timeframe: 'hour' | 'day' | 'week' | 'month' = 'week'): Promise<Earthquake[]> {
    try {
      const now = Date.now();
      
      if (now - this.lastFetch < this.cacheDuration && this.cachedData.length > 0) {
        return this.cachedData;
      }

      try {
        const earthquakes = await this.fetchWithRetry(timeframe);
        
        if (earthquakes.length > 0) {
          try {
            await indexedDBService.saveEarthquakes(earthquakes);
          } catch (saveError) {
            console.error('Failed to save to IndexedDB:', saveError);
          }
        }
        
        return earthquakes;
      } catch (apiError) {
        console.error('Failed to fetch from API, trying IndexedDB...');
        
        try {
          const cachedEarthquakes = await indexedDBService.getAllEarthquakes();
          if (cachedEarthquakes.length > 0) {
            console.log('Loaded earthquakes from IndexedDB cache');
            this.cachedData = cachedEarthquakes;
            return cachedEarthquakes;
          }
        } catch (dbError) {
          console.error('Failed to load from IndexedDB:', dbError);
        }
        
        if (this.cachedData.length > 0) {
          console.log('Returning in-memory cached data');
          return this.cachedData;
        }

        throw new Error('No earthquake data available from any source');
      }
    } catch (error) {
      console.error('Critical error in fetchEarthquakes:', error);
      return this.cachedData.length > 0 ? this.cachedData : [];
    }
  }

  private async fetchWithRetry(timeframe: string, attempt: number = 1): Promise<Earthquake[]> {
    try {
      if (!timeframe || typeof timeframe !== 'string') {
        throw new Error('Invalid timeframe parameter');
      }

      const url = `${USGS_API_BASE}/all_${timeframe}.geojson`;
      
      let response;
      try {
        response = await fetch(url);
      } catch (fetchError) {
        throw new Error(`Network error: ${(fetchError as Error).message}`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      let data: EarthquakeResponse;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Failed to parse earthquake data');
      }

      if (!data.features || !Array.isArray(data.features)) {
        throw new Error('Invalid earthquake data format');
      }
      
      const rawEarthquakes = data.features
        .map(feature => {
          try {
            if (!feature.geometry || !feature.geometry.coordinates) {
              return null;
            }
            const [lng, lat] = feature.geometry.coordinates;
            if (!(lat >= SOUTHERN_LEYTE_BOUNDS.minLat &&
                  lat <= SOUTHERN_LEYTE_BOUNDS.maxLat &&
                  lng >= SOUTHERN_LEYTE_BOUNDS.minLng &&
                  lng <= SOUTHERN_LEYTE_BOUNDS.maxLng)) {
              return null;
            }

            return {
              id: feature.id,
              magnitude: feature.properties.mag,
              place: feature.properties.place,
              time: feature.properties.time,
              latitude: feature.geometry.coordinates[1],
              longitude: feature.geometry.coordinates[0],
              depth: feature.geometry.coordinates[2],
              url: feature.properties.url,
              felt: feature.properties.felt,
              alert: feature.properties.alert,
            };
          } catch (error) {
            console.error('Error mapping earthquake feature:', error);
            return null;
          }
        })
        .filter(eq => eq !== null);

      const earthquakes: Earthquake[] = rawEarthquakes as Earthquake[];
      earthquakes.sort((a, b) => b.time - a.time);

      this.cachedData = earthquakes;
      this.lastFetch = Date.now();
      
      return earthquakes;
    } catch (error) {
      console.error(`Error fetching earthquake data (attempt ${attempt}):`, error);
      
      if (attempt < this.maxRetries) {
        await this.delay(this.retryDelay * attempt);
        return this.fetchWithRetry(timeframe, attempt + 1);
      }
      
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getEarthquakesByTimeRange(earthquakes: Earthquake[], hours: number): Earthquake[] {
    try {
      if (!earthquakes || !Array.isArray(earthquakes)) {
        console.error('Invalid earthquakes array');
        return [];
      }
      if (!hours || hours < 0) {
        console.error('Invalid hours parameter');
        return earthquakes;
      }
      const cutoff = Date.now() - hours * 60 * 60 * 1000;
      return earthquakes.filter(eq => eq && eq.time >= cutoff);
    } catch (error) {
      console.error('Error filtering earthquakes by time range:', error);
      return [];
    }
  }

  getStrongestEarthquake(earthquakes: Earthquake[]): Earthquake | null {
    try {
      if (!earthquakes || !Array.isArray(earthquakes) || earthquakes.length === 0) {
        return null;
      }
      return earthquakes.reduce((strongest, current) => {
        try {
          return current.magnitude > strongest.magnitude ? current : strongest;
        } catch (error) {
          return strongest;
        }
      });
    } catch (error) {
      console.error('Error finding strongest earthquake:', error);
      return null;
    }
  }

  filterByMagnitude(earthquakes: Earthquake[], minMagnitude: number): Earthquake[] {
    try {
      if (!earthquakes || !Array.isArray(earthquakes)) {
        console.error('Invalid earthquakes array');
        return [];
      }
      if (isNaN(minMagnitude)) {
        console.error('Invalid minMagnitude parameter');
        return earthquakes;
      }
      return earthquakes.filter(eq => eq && eq.magnitude >= minMagnitude);
    } catch (error) {
      console.error('Error filtering earthquakes by magnitude:', error);
      return [];
    }
  }

  getMagnitudeColor(magnitude: number): string {
    try {
      if (isNaN(magnitude)) {
        console.error('Invalid magnitude value');
        return '#16a34a';
      }
      if (magnitude >= 7.0) return '#dc2626';
      if (magnitude >= 5.5) return '#f97316';
      if (magnitude >= 4.0) return '#facc15';
      return '#16a34a';
    } catch (error) {
      console.error('Error getting magnitude color:', error);
      return '#16a34a';
    }
  }

  getMagnitudeLabel(magnitude: number): string {
    try {
      if (isNaN(magnitude)) {
        console.error('Invalid magnitude value');
        return 'Unknown';
      }
      if (magnitude >= 7.0) return 'Major';
      if (magnitude >= 5.5) return 'Strong';
      if (magnitude >= 4.0) return 'Moderate';
      return 'Minor';
    } catch (error) {
      console.error('Error getting magnitude label:', error);
      return 'Unknown';
    }
  }

  formatTime(timestamp: number): string {
    try {
      if (!timestamp || isNaN(timestamp)) {
        console.error('Invalid timestamp');
        return 'Unknown';
      }

      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        console.error('Invalid date from timestamp');
        return 'Unknown';
      }

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString('en-PH', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Unknown';
    }
  }
}

export const earthquakeService = new EarthquakeService();
