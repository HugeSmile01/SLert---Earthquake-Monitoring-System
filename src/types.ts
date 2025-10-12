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
  editedByAdmin?: boolean;
  originalMagnitude?: number;
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

export interface CommunityNews {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
  hearts: number;
  heartedBy: string[];
}

export interface EarthquakeReport {
  id: string;
  earthquakeId: string;
  userId: string;
  userName: string;
  experience: string;
  intensity: number;
  timestamp: number;
  upvotes: number;
  downvotes: number;
  votedBy: { [userId: string]: 'up' | 'down' };
}

export interface Comment {
  id: string;
  earthquakeId: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: number;
}
