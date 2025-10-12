import type { Earthquake } from './types';

interface FilterOptions {
  minMagnitude?: number;
  maxMagnitude?: number;
  startDate?: number;
  endDate?: number;
  searchTerm?: string;
}

class FilterService {
  filterEarthquakes(earthquakes: Earthquake[], options: FilterOptions): Earthquake[] {
    let filtered = [...earthquakes];

    // Filter by magnitude
    if (options.minMagnitude !== undefined) {
      filtered = filtered.filter(eq => eq.magnitude >= options.minMagnitude!);
    }
    if (options.maxMagnitude !== undefined) {
      filtered = filtered.filter(eq => eq.magnitude <= options.maxMagnitude!);
    }

    // Filter by date range
    if (options.startDate !== undefined) {
      filtered = filtered.filter(eq => eq.time >= options.startDate!);
    }
    if (options.endDate !== undefined) {
      filtered = filtered.filter(eq => eq.time <= options.endDate!);
    }

    // Filter by search term (location/place)
    if (options.searchTerm && options.searchTerm.trim() !== '') {
      const searchLower = options.searchTerm.toLowerCase();
      filtered = filtered.filter(eq => 
        eq.place.toLowerCase().includes(searchLower) ||
        eq.id.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  sortEarthquakes(
    earthquakes: Earthquake[], 
    sortBy: 'time' | 'magnitude' | 'depth' | 'place',
    order: 'asc' | 'desc' = 'desc'
  ): Earthquake[] {
    const sorted = [...earthquakes];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'time':
          comparison = a.time - b.time;
          break;
        case 'magnitude':
          comparison = a.magnitude - b.magnitude;
          break;
        case 'depth':
          comparison = a.depth - b.depth;
          break;
        case 'place':
          comparison = a.place.localeCompare(b.place);
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  exportToCSV(earthquakes: Earthquake[], filename: string = 'earthquakes.csv'): void {
    const headers = ['ID', 'Magnitude', 'Place', 'Time', 'Latitude', 'Longitude', 'Depth (km)', 'URL'];
    const rows = earthquakes.map(eq => [
      eq.id,
      eq.magnitude,
      eq.place,
      new Date(eq.time).toISOString(),
      eq.latitude,
      eq.longitude,
      eq.depth,
      eq.url,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    this.downloadFile(csvContent, filename, 'text/csv');
  }

  exportToJSON(earthquakes: Earthquake[], filename: string = 'earthquakes.json'): void {
    const jsonContent = JSON.stringify(earthquakes, null, 2);
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const filterService = new FilterService();
