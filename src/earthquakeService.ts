import type { Earthquake, EarthquakeResponse } from './types';

const USGS_API_BASE = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary';
const PHILIPPINES_BOUNDS = {
  minLat: 4.5,
  maxLat: 21.0,
  minLng: 116.0,
  maxLng: 127.0,
};

class EarthquakeService {
  private cachedData: Earthquake[] = [];
  private lastFetch: number = 0;
  private cacheDuration: number = 60000; // 1 minute

  /**
   * Fetch earthquakes from USGS API
   */
  async fetchEarthquakes(timeframe: 'hour' | 'day' | 'week' | 'month' = 'week'): Promise<Earthquake[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (now - this.lastFetch < this.cacheDuration && this.cachedData.length > 0) {
      return this.cachedData;
    }

    try {
      const url = `${USGS_API_BASE}/all_${timeframe}.geojson`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: EarthquakeResponse = await response.json();
      
      // Filter for Philippines region
      const earthquakes = data.features
        .filter(feature => {
          const [lng, lat] = feature.geometry.coordinates;
          return (
            lat >= PHILIPPINES_BOUNDS.minLat &&
            lat <= PHILIPPINES_BOUNDS.maxLat &&
            lng >= PHILIPPINES_BOUNDS.minLng &&
            lng <= PHILIPPINES_BOUNDS.maxLng
          );
        })
        .map(feature => ({
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
        }))
        .sort((a, b) => b.time - a.time);

      this.cachedData = earthquakes;
      this.lastFetch = now;
      
      return earthquakes;
    } catch (error) {
      console.error('Error fetching earthquake data:', error);
      // Return cached data if available, even if expired
      return this.cachedData;
    }
  }

  /**
   * Get earthquakes within a specific time range
   */
  getEarthquakesByTimeRange(earthquakes: Earthquake[], hours: number): Earthquake[] {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return earthquakes.filter(eq => eq.time >= cutoff);
  }

  /**
   * Get the strongest earthquake from a list
   */
  getStrongestEarthquake(earthquakes: Earthquake[]): Earthquake | null {
    if (earthquakes.length === 0) return null;
    return earthquakes.reduce((strongest, current) => 
      current.magnitude > strongest.magnitude ? current : strongest
    );
  }

  /**
   * Filter earthquakes by magnitude threshold
   */
  filterByMagnitude(earthquakes: Earthquake[], minMagnitude: number): Earthquake[] {
    return earthquakes.filter(eq => eq.magnitude >= minMagnitude);
  }

  /**
   * Get magnitude color based on severity
   */
  getMagnitudeColor(magnitude: number): string {
    if (magnitude >= 7.0) return '#dc2626'; // red
    if (magnitude >= 5.5) return '#f97316'; // orange
    if (magnitude >= 4.0) return '#facc15'; // yellow
    return '#16a34a'; // green
  }

  /**
   * Get magnitude label
   */
  getMagnitudeLabel(magnitude: number): string {
    if (magnitude >= 7.0) return 'Major';
    if (magnitude >= 5.5) return 'Strong';
    if (magnitude >= 4.0) return 'Moderate';
    return 'Minor';
  }

  /**
   * Format earthquake time
   */
  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
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
  }
}

export const earthquakeService = new EarthquakeService();
