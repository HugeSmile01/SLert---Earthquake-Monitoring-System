import type { Earthquake } from './types';

class NotificationService {
  private permission: NotificationPermission = 'default';
  private notifiedEarthquakes: Set<string> = new Set();

  async init(): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return;
    }

    this.permission = Notification.permission;
    console.log('Notification service initialized. Permission:', this.permission);
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      this.permission = await Notification.requestPermission();
      console.log('Notification permission:', this.permission);
      return this.permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async notifyEarthquake(earthquake: Earthquake, threshold: number = 4.0): Promise<void> {
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
        event.preventDefault();
        window.open(earthquake.url, '_blank');
        notification.close();
      };

      this.notifiedEarthquakes.add(earthquake.id);
      console.log(`Notification sent for earthquake: ${earthquake.id}`);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  async notifyMultipleEarthquakes(earthquakes: Earthquake[], threshold: number = 4.0): Promise<void> {
    const significantEarthquakes = earthquakes.filter(eq => 
      eq.magnitude >= threshold && !this.notifiedEarthquakes.has(eq.id)
    );

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
      await this.notifyEarthquake(earthquake, threshold);
    }
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  clearNotifiedEarthquakes(): void {
    this.notifiedEarthquakes.clear();
  }
}

export const notificationService = new NotificationService();
