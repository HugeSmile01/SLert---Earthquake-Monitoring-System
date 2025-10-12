import type { Earthquake } from './types';

class NotificationService {
  private permission: NotificationPermission = 'default';
  private notifiedEarthquakes: Set<string> = new Set();

  async init(): Promise<void> {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        console.warn('This browser does not support desktop notifications');
        return;
      }

      this.permission = Notification.permission;
      console.log('Notification service initialized. Permission:', this.permission);
    } catch (error) {
      console.error('Error initializing notification service:', error);
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        return false;
      }

      if (this.permission === 'granted') {
        return true;
      }

      try {
        this.permission = await Notification.requestPermission();
        console.log('Notification permission:', this.permission);
        return this.permission === 'granted';
      } catch (requestError) {
        console.error('Error requesting notification permission:', requestError);
        return false;
      }
    } catch (error) {
      console.error('Error in requestPermission:', error);
      return false;
    }
  }

  async notifyEarthquake(earthquake: Earthquake, threshold: number = 4.0): Promise<void> {
    try {
      if (!earthquake) {
        console.error('Invalid earthquake data');
        return;
      }

      if (typeof threshold !== 'number' || isNaN(threshold)) {
        console.error('Invalid threshold');
        threshold = 4.0;
      }

      if (earthquake.magnitude < threshold) {
        return;
      }

      if (this.notifiedEarthquakes.has(earthquake.id)) {
        return;
      }

      if (this.permission !== 'granted') {
        const granted = await this.requestPermission();
        if (!granted) {
          return;
        }
      }

      try {
        if (typeof Notification === 'undefined') {
          throw new Error('Notification API not available');
        }

        const notification = new Notification('🌏 Earthquake Alert', {
          body: `Magnitude ${earthquake.magnitude.toFixed(1)} earthquake detected\n${earthquake.place}`,
          icon: './images/icon-192.png',
          badge: './images/icon-192.png',
          tag: earthquake.id,
          requireInteraction: earthquake.magnitude >= 5.0,
          data: {
            url: earthquake.url,
            earthquake: earthquake,
          },
        });

        notification.onclick = (event) => {
          try {
            event.preventDefault();
            if (earthquake.url && typeof window !== 'undefined') {
              window.open(earthquake.url, '_blank');
            }
            notification.close();
          } catch (clickError) {
            console.error('Error handling notification click:', clickError);
          }
        };

        this.notifiedEarthquakes.add(earthquake.id);
        console.log(`Notification sent for earthquake: ${earthquake.id}`);
      } catch (notifyError) {
        console.error('Error creating notification:', notifyError);
        throw notifyError;
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  async notifyMultipleEarthquakes(earthquakes: Earthquake[], threshold: number = 4.0): Promise<void> {
    try {
      if (!earthquakes || !Array.isArray(earthquakes)) {
        console.error('Invalid earthquakes array');
        return;
      }

      if (typeof threshold !== 'number' || isNaN(threshold)) {
        console.error('Invalid threshold');
        threshold = 4.0;
      }

      const significantEarthquakes = earthquakes.filter(eq => {
        try {
          return eq && eq.magnitude >= threshold && !this.notifiedEarthquakes.has(eq.id);
        } catch (error) {
          console.error('Error filtering earthquake:', error);
          return false;
        }
      });

      if (significantEarthquakes.length === 0) {
        return;
      }

      if (this.permission !== 'granted') {
        const granted = await this.requestPermission();
        if (!granted) {
          return;
        }
      }

      for (const earthquake of significantEarthquakes) {
        try {
          await this.notifyEarthquake(earthquake, threshold);
        } catch (error) {
          console.error('Error notifying individual earthquake:', error);
        }
      }
    } catch (error) {
      console.error('Error notifying multiple earthquakes:', error);
    }
  }

  getPermissionStatus(): NotificationPermission {
    try {
      return this.permission;
    } catch (error) {
      console.error('Error getting permission status:', error);
      return 'default';
    }
  }

  clearNotifiedEarthquakes(): void {
    try {
      this.notifiedEarthquakes.clear();
    } catch (error) {
      console.error('Error clearing notified earthquakes:', error);
    }
  }
}

export const notificationService = new NotificationService();
