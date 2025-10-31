/**
 * Emergency Shelter Service
 * Provides information about emergency evacuation centers and shelters
 */

export interface EmergencyShelter {
  id: string;
  name: string;
  address: string;
  municipality: string;
  province: string;
  latitude: number;
  longitude: number;
  capacity: number;
  facilities: string[];
  contactNumber?: string;
  isOperational: boolean;
  type: 'Evacuation Center' | 'School' | 'Gymnasium' | 'Community Center' | 'Government Building';
}

class EmergencyShelterService {
  // Sample shelters - In production, this would come from an API or database
  private shelters: EmergencyShelter[] = [
    {
      id: 'sl-001',
      name: 'Maasin City Sports Complex',
      address: 'Mantahan, Maasin City',
      municipality: 'Maasin City',
      province: 'Southern Leyte',
      latitude: 10.1333,
      longitude: 124.8333,
      capacity: 500,
      facilities: ['Medical Station', 'Water Supply', 'Restrooms', 'Generator'],
      contactNumber: '(053) 570-9234',
      isOperational: true,
      type: 'Gymnasium'
    },
    {
      id: 'sl-002',
      name: 'Southern Leyte State University Gymnasium',
      address: 'Tomas Oppus, Southern Leyte',
      municipality: 'Tomas Oppus',
      province: 'Southern Leyte',
      latitude: 10.2667,
      longitude: 125.0167,
      capacity: 800,
      facilities: ['Medical Station', 'Water Supply', 'Restrooms', 'Kitchen'],
      contactNumber: '(053) 574-9123',
      isOperational: true,
      type: 'Gymnasium'
    },
    {
      id: 'sl-003',
      name: 'Sogod Municipal Gym',
      address: 'Poblacion, Sogod',
      municipality: 'Sogod',
      province: 'Southern Leyte',
      latitude: 10.3833,
      longitude: 124.9833,
      capacity: 400,
      facilities: ['Water Supply', 'Restrooms', 'First Aid'],
      contactNumber: '(053) 577-8012',
      isOperational: true,
      type: 'Gymnasium'
    },
    {
      id: 'sl-004',
      name: 'Hinunangan Evacuation Center',
      address: 'Poblacion, Hinunangan',
      municipality: 'Hinunangan',
      province: 'Southern Leyte',
      latitude: 10.4000,
      longitude: 125.2000,
      capacity: 300,
      facilities: ['Water Supply', 'Restrooms'],
      isOperational: true,
      type: 'Evacuation Center'
    },
    {
      id: 'sl-005',
      name: 'Liloan Community Center',
      address: 'Poblacion, Liloan',
      municipality: 'Liloan',
      province: 'Southern Leyte',
      latitude: 10.1833,
      longitude: 125.1167,
      capacity: 250,
      facilities: ['Water Supply', 'First Aid'],
      isOperational: true,
      type: 'Community Center'
    },
    // Metro Manila shelters
    {
      id: 'mm-001',
      name: 'Quezon City Memorial Circle',
      address: 'Quezon Memorial Circle, Quezon City',
      municipality: 'Quezon City',
      province: 'Metro Manila',
      latitude: 14.6539,
      longitude: 121.0494,
      capacity: 5000,
      facilities: ['Medical Station', 'Water Supply', 'Restrooms', 'Food Distribution'],
      contactNumber: '(02) 8988-4242',
      isOperational: true,
      type: 'Evacuation Center'
    },
    {
      id: 'mm-002',
      name: 'Manila City Hall Complex',
      address: 'Ermita, Manila',
      municipality: 'Manila',
      province: 'Metro Manila',
      latitude: 14.5907,
      longitude: 120.9791,
      capacity: 2000,
      facilities: ['Medical Station', 'Water Supply', 'Restrooms', 'Security'],
      contactNumber: '(02) 8527-5174',
      isOperational: true,
      type: 'Government Building'
    }
  ];

  /**
   * Get all shelters
   */
  getAllShelters(): EmergencyShelter[] {
    return this.shelters.filter(s => s.isOperational);
  }

  /**
   * Get shelters by region/province
   */
  getSheltersByProvince(province: string): EmergencyShelter[] {
    return this.shelters.filter(
      s => s.isOperational && s.province.toLowerCase().includes(province.toLowerCase())
    );
  }

  /**
   * Get shelters by municipality
   */
  getSheltersByMunicipality(municipality: string): EmergencyShelter[] {
    return this.shelters.filter(
      s => s.isOperational && s.municipality.toLowerCase().includes(municipality.toLowerCase())
    );
  }

  /**
   * Find nearest shelters to a given location
   */
  findNearestShelters(latitude: number, longitude: number, limit: number = 5): EmergencyShelter[] {
    const sheltersWithDistance = this.shelters
      .filter(s => s.isOperational)
      .map(shelter => ({
        shelter,
        distance: this.calculateDistance(latitude, longitude, shelter.latitude, shelter.longitude)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return sheltersWithDistance.map(item => item.shelter);
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get shelter type icon
   */
  getShelterIcon(type: string): string {
    switch (type) {
      case 'Evacuation Center': return '🏕️';
      case 'School': return '🏫';
      case 'Gymnasium': return '🏟️';
      case 'Community Center': return '🏛️';
      case 'Government Building': return '🏢';
      default: return '📍';
    }
  }

  /**
   * Escape HTML to prevent XSS attacks
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get shelter card HTML
   */
  getShelterCardHTML(shelter: EmergencyShelter, distance?: number): string {
    const icon = this.getShelterIcon(shelter.type);
    const distanceText = distance ? `<span class="text-sm text-blue-600 dark:text-blue-400">📍 ${distance.toFixed(1)} km away</span>` : '';
    
    // Escape HTML to prevent XSS
    const escapedName = this.escapeHtml(shelter.name);
    const escapedAddress = this.escapeHtml(shelter.address);
    
    return `
      <div class="border dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700 hover:shadow-md transition">
        <div class="flex items-start gap-3">
          <span class="text-3xl">${icon}</span>
          <div class="flex-1">
            <h4 class="font-bold text-gray-800 dark:text-gray-200 mb-1">${escapedName}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">${shelter.type} • ${this.escapeHtml(shelter.municipality)}</p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${escapedAddress}</p>
            ${distanceText}
            <div class="flex flex-wrap gap-2 mt-2">
              <span class="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded">
                Capacity: ${shelter.capacity}
              </span>
              ${shelter.contactNumber ? `
                <a href="tel:${shelter.contactNumber}" class="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded hover:underline">
                  📞 ${shelter.contactNumber}
                </a>
              ` : ''}
            </div>
            <div class="mt-2">
              <p class="text-xs text-gray-500 dark:text-gray-500">Facilities:</p>
              <div class="flex flex-wrap gap-1 mt-1">
                ${shelter.facilities.map(f => `
                  <span class="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                    ${f}
                  </span>
                `).join('')}
              </div>
            </div>
            <button onclick="showShelterOnMap(${shelter.latitude}, ${shelter.longitude}, '${shelter.name.replace(/'/g, "\\'")}')" 
                    class="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
              📍 Show on Map
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get shelters list HTML
   */
  getSheltersListHTML(shelters: EmergencyShelter[]): string {
    if (shelters.length === 0) {
      return '<p class="text-gray-500 dark:text-gray-400 text-center py-4">No emergency shelters found in this area.</p>';
    }

    return `
      <div class="space-y-3">
        ${shelters.map(shelter => this.getShelterCardHTML(shelter)).join('')}
      </div>
    `;
  }
}

export const emergencyShelterService = new EmergencyShelterService();
