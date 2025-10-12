import type { Earthquake, EarthquakeResponse } from './types';

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
    const now = Date.now();

    if (now - this.lastFetch < this.cacheDuration && this.cachedData.length > 0) {
      return this.cachedData;
    }

    return this.fetchWithRetry(timeframe);
  }

  private async fetchWithRetry(timeframe: string, attempt: number = 1): Promise<Earthquake[]> {
    try {
      const url = `${USGS_API_BASE}/all_${timeframe}.geojson`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: EarthquakeResponse = await response.json();

      const earthquakes = data.features
        .filter(feature => {
          const [lng, lat] = feature.geometry.coordinates;
          return (
            lat >= SOUTHERN_LEYTE_BOUNDS.minLat &&
            lat <= SOUTHERN_LEYTE_BOUNDS.maxLat &&
            lng >= SOUTHERN_LEYTE_BOUNDS.minLng &&
            lng <= SOUTHERN_LEYTE_BOUNDS.maxLng
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
      this.lastFetch = Date.now();

      return earthquakes;
    } catch (error) {
      console.error(`Error fetching earthquake data (attempt ${attempt}):`, error);

      if (attempt < this.maxRetries) {
        await this.delay(this.retryDelay * attempt);
        return this.fetchWithRetry(timeframe, attempt + 1);
      }

      return this.cachedData;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getEarthquakesByTimeRange(earthquakes: Earthquake[], hours: number): Earthquake[] {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return earthquakes.filter(eq => eq.time >= cutoff);
  }

  getStrongestEarthquake(earthquakes: Earthquake[]): Earthquake | null {
    if (earthquakes.length === 0) return null;
    return earthquakes.reduce((strongest, current) =>
      current.magnitude > strongest.magnitude ? current : strongest,
    );
  }

  filterByMagnitude(earthquakes: Earthquake[], minMagnitude: number): Earthquake[] {
    return earthquakes.filter(eq => eq.magnitude >= minMagnitude);
  }

  getMagnitudeColor(magnitude: number): string {
    if (magnitude >= 7.0) return '#dc2626';
    if (magnitude >= 5.5) return '#f97316';
    if (magnitude >= 4.0) return '#facc15';
    return '#16a34a';
  }

  getMagnitudeLabel(magnitude: number): string {
    if (magnitude >= 7.0) return 'Major';
    if (magnitude >= 5.5) return 'Strong';
    if (magnitude >= 4.0) return 'Moderate';
    return 'Minor';
  }

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
