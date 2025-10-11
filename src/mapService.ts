import L from 'leaflet';
import type { Earthquake } from './types';
import { earthquakeService } from './earthquakeService';

// Fix Leaflet default icon issue with bundlers
// Use local marker icons instead of CDN for security and reliability
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
});

class MapService {
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];

  /**
   * Initialize the map
   */
  initMap(containerId: string): void {
    if (this.map) {
      return;
    }

    // Center on Philippines
    this.map = L.map(containerId).setView([12.8797, 121.7740], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(this.map);

    // Add Philippines boundary highlight
    L.rectangle(
      [[4.5, 116.0], [21.0, 127.0]],
      {
        color: '#003366',
        weight: 2,
        fillOpacity: 0.05,
      }
    ).addTo(this.map);
  }

  /**
   * Clear all markers from the map
   */
  clearMarkers(): void {
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
  }

  /**
   * Add earthquake markers to the map
   */
  addEarthquakeMarkers(earthquakes: Earthquake[]): void {
    if (!this.map) return;

    this.clearMarkers();

    earthquakes.forEach(earthquake => {
      const color = earthquakeService.getMagnitudeColor(earthquake.magnitude);
      const label = earthquakeService.getMagnitudeLabel(earthquake.magnitude);

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: ${Math.max(20, earthquake.magnitude * 5)}px;
            height: ${Math.max(20, earthquake.magnitude * 5)}px;
            background-color: ${color};
            border: 2px solid white;
            border-radius: 50%;
            opacity: 0.8;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>
        `,
        iconSize: [earthquake.magnitude * 5, earthquake.magnitude * 5],
        iconAnchor: [earthquake.magnitude * 2.5, earthquake.magnitude * 2.5],
      });

      const marker = L.marker([earthquake.latitude, earthquake.longitude], { icon })
        .addTo(this.map!);

      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="font-weight: bold; margin-bottom: 8px; color: ${color};">
            M${earthquake.magnitude.toFixed(1)} ${label}
          </h3>
          <p style="margin-bottom: 4px;"><strong>Location:</strong> ${earthquake.place}</p>
          <p style="margin-bottom: 4px;"><strong>Time:</strong> ${earthquakeService.formatTime(earthquake.time)}</p>
          <p style="margin-bottom: 4px;"><strong>Depth:</strong> ${earthquake.depth.toFixed(1)} km</p>
          ${earthquake.felt ? `<p style="margin-bottom: 4px;"><strong>Felt Reports:</strong> ${earthquake.felt}</p>` : ''}
          <a href="${earthquake.url}" target="_blank" style="color: #003366; text-decoration: underline;">
            More details →
          </a>
        </div>
      `;

      marker.bindPopup(popupContent);

      this.markers.push(marker);
    });
  }

  /**
   * Get the map instance
   */
  getMap(): L.Map | null {
    return this.map;
  }
}

export const mapService = new MapService();
