// Type definitions
export interface Earthquake {
  id: string;
  magnitude: number;
  place: string;
  time: number;
  latitude: number;
  longitude: number;
  depth: number;
  url: string;
  felt?: number;
  alert?: string;
}

export interface EarthquakeResponse {
  type: string;
  features: Array<{
    id: string;
    properties: {
      mag: number;
      place: string;
      time: number;
      url: string;
      felt?: number;
      alert?: string;
    };
    geometry: {
      coordinates: [number, number, number];
    };
  }>;
}
