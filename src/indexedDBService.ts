import type { Earthquake } from './types';

const DB_NAME = 'EarthquakeDB';
const DB_VERSION = 1;
const STORE_NAME = 'earthquakes';

class IndexedDBService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB failed to open');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('time', 'time', { unique: false });
          objectStore.createIndex('magnitude', 'magnitude', { unique: false });
          console.log('IndexedDB object store created');
        }
      };
    });
  }

  async saveEarthquakes(earthquakes: Earthquake[]): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);

      earthquakes.forEach(earthquake => {
        objectStore.put(earthquake);
      });

      transaction.oncomplete = () => {
        console.log(`Saved ${earthquakes.length} earthquakes to IndexedDB`);
        resolve();
      };

      transaction.onerror = () => {
        console.error('Error saving earthquakes to IndexedDB');
        reject(transaction.error);
      };
    });
  }

  async getAllEarthquakes(): Promise<Earthquake[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const earthquakes = request.result as Earthquake[];
        console.log(`Retrieved ${earthquakes.length} earthquakes from IndexedDB`);
        resolve(earthquakes);
      };

      request.onerror = () => {
        console.error('Error retrieving earthquakes from IndexedDB');
        reject(request.error);
      };
    });
  }

  async getEarthquakesByTimeRange(startTime: number, endTime: number): Promise<Earthquake[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const index = objectStore.index('time');
      const range = IDBKeyRange.bound(startTime, endTime);
      const request = index.getAll(range);

      request.onsuccess = () => {
        resolve(request.result as Earthquake[]);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async clearOldData(olderThanDays: number = 30): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const index = objectStore.index('time');
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      transaction.oncomplete = () => {
        console.log('Cleared old earthquake data from IndexedDB');
        resolve();
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  }
}

export const indexedDBService = new IndexedDBService();
