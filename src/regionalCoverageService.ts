/**
 * Regional Coverage Service
 * Provides multi-region support for earthquake monitoring across Philippines
 */

export interface Region {
  id: string;
  name: string;
  bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  riskLevel: 'High' | 'Moderate' | 'Low';
  description: string;
}

class RegionalCoverageService {
  private regions: Region[] = [
    {
      id: 'southern-leyte',
      name: 'Southern Leyte',
      bounds: { minLat: 9.8, maxLat: 10.8, minLng: 124.5, maxLng: 125.5 },
      center: { lat: 10.3, lng: 125.0 },
      zoom: 10,
      riskLevel: 'High',
      description: 'Southern Leyte province - historically active seismic zone'
    },
    {
      id: 'metro-manila',
      name: 'Metro Manila (NCR)',
      bounds: { minLat: 14.35, maxLat: 14.85, minLng: 120.9, maxLng: 121.2 },
      center: { lat: 14.6, lng: 121.0 },
      zoom: 11,
      riskLevel: 'High',
      description: 'National Capital Region - West Valley Fault zone'
    },
    {
      id: 'mindanao',
      name: 'Mindanao Region',
      bounds: { minLat: 5.0, maxLat: 10.0, minLng: 121.0, maxLng: 127.0 },
      center: { lat: 7.5, lng: 124.5 },
      zoom: 8,
      riskLevel: 'High',
      description: 'Mindanao island - highly active seismic zone'
    },
    {
      id: 'visayas',
      name: 'Visayas Region',
      bounds: { minLat: 9.0, maxLat: 12.5, minLng: 122.0, maxLng: 126.0 },
      center: { lat: 10.7, lng: 123.9 },
      zoom: 8,
      riskLevel: 'High',
      description: 'Central Philippines - includes Cebu, Bohol, Leyte'
    },
    {
      id: 'luzon',
      name: 'Luzon Region',
      bounds: { minLat: 12.0, maxLat: 19.0, minLng: 119.5, maxLng: 122.5 },
      center: { lat: 15.5, lng: 121.0 },
      zoom: 7,
      riskLevel: 'Moderate',
      description: 'Northern Philippines - includes major fault lines'
    },
    {
      id: 'philippines-nationwide',
      name: 'Philippines (Nationwide)',
      bounds: { minLat: 4.5, maxLat: 21.0, minLng: 116.0, maxLng: 127.0 },
      center: { lat: 12.8, lng: 121.8 },
      zoom: 6,
      riskLevel: 'High',
      description: 'Entire Philippines archipelago'
    }
  ];

  private currentRegion: Region;

  constructor() {
    // Load saved region or default to Southern Leyte
    const savedRegionId = localStorage.getItem('selected_region');
    const defaultRegion = this.regions.length > 0 ? this.regions[0] : null;
    this.currentRegion = this.getRegion(savedRegionId || 'southern-leyte') || defaultRegion!;
    
    if (!this.currentRegion) {
      throw new Error('No regions available - check regionalCoverageService configuration');
    }
  }

  /**
   * Get all available regions
   */
  getAllRegions(): Region[] {
    return this.regions;
  }

  /**
   * Get region by ID
   */
  getRegion(id: string): Region | null {
    return this.regions.find(r => r.id === id) || null;
  }

  /**
   * Get current selected region
   */
  getCurrentRegion(): Region {
    return this.currentRegion;
  }

  /**
   * Set current region
   */
  setCurrentRegion(regionId: string): boolean {
    const region = this.getRegion(regionId);
    if (!region) return false;

    this.currentRegion = region;
    localStorage.setItem('selected_region', regionId);
    
    // Dispatch custom event for region change
    window.dispatchEvent(new CustomEvent('regionChanged', { detail: region }));
    
    return true;
  }

  /**
   * Check if earthquake is in current region
   */
  isInCurrentRegion(lat: number, lng: number): boolean {
    const bounds = this.currentRegion.bounds;
    return (
      lat >= bounds.minLat &&
      lat <= bounds.maxLat &&
      lng >= bounds.minLng &&
      lng <= bounds.maxLng
    );
  }

  /**
   * Get risk level color
   */
  getRiskLevelColor(riskLevel: string): string {
    switch (riskLevel) {
      case 'High': return '#dc2626';
      case 'Moderate': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  }

  /**
   * Get region selector HTML
   */
  getRegionSelectorHTML(): string {
    return `
      <div class="mb-4">
        <label for="region-selector" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Monitoring Region
        </label>
        <select id="region-selector" 
                class="w-full border dark:border-gray-600 rounded px-4 py-2 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-phivolcs-blue">
          ${this.regions.map(region => `
            <option value="${region.id}" ${region.id === this.currentRegion.id ? 'selected' : ''}>
              ${region.name} - ${region.riskLevel} Risk
            </option>
          `).join('')}
        </select>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
          ${this.currentRegion.description}
        </p>
      </div>
    `;
  }

  /**
   * Initialize region selector
   */
  initRegionSelector(): void {
    const selector = document.getElementById('region-selector') as HTMLSelectElement;
    if (!selector) return;

    selector.addEventListener('change', (e) => {
      const target = e.target as HTMLSelectElement;
      this.setCurrentRegion(target.value);
    });
  }
}

export const regionalCoverageService = new RegionalCoverageService();
