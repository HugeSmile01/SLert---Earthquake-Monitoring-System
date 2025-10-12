import type { Earthquake } from './types';
import Swal from 'sweetalert2';

class AlertService {
  /**
   * Initialize the alert service
   */
  init(): void {
    // SweetAlert2 doesn't require initialization
  }

  /**
   * Show an alert using SweetAlert2
   */
  showAlert(message: string, type: 'info' | 'warning' | 'danger' = 'danger'): void {
    const iconMap = {
      danger: 'error',
      warning: 'warning',
      info: 'success',
    } as const;

    Swal.fire({
      title: type === 'danger' ? 'Alert!' : type === 'warning' ? 'Warning!' : 'Success!',
      text: message,
      icon: iconMap[type],
      confirmButtonColor: '#003366',
      timer: type === 'info' ? 3000 : undefined,
      timerProgressBar: type === 'info',
    });
  }

  /**
   * Hide the alert (SweetAlert2 closes automatically)
   */
  hideAlert(): void {
    Swal.close();
  }

  /**
   * Check for significant earthquakes and show alerts
   */
  checkForAlerts(earthquakes: Earthquake[]): void {
    // Check for recent significant earthquakes (last 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const recentSignificant = earthquakes.filter(
      eq => eq.time >= fiveMinutesAgo && eq.magnitude >= 5.0,
    );

    if (recentSignificant.length > 0) {
      const strongest = recentSignificant.reduce((prev, current) =>
        current.magnitude > prev.magnitude ? current : prev,
      );

      const message = `Magnitude ${strongest.magnitude.toFixed(1)} earthquake detected ${strongest.place}`;

      Swal.fire({
        title: '⚠️ Earthquake Alert',
        text: message,
        icon: 'warning',
        confirmButtonColor: '#003366',
        confirmButtonText: 'Stay Safe',
        timer: 10000,
        timerProgressBar: true,
      });

      // Log alert for Firebase integration
      this.logAlert(strongest);
    }
  }

  /**
   * Log alert to console (Firebase integration placeholder)
   */
  private logAlert(earthquake: Earthquake): void {
    console.log('🔥 Alert Logged (Firebase):');
    console.log(`Magnitude ${earthquake.magnitude.toFixed(1)} earthquake detected`);
    console.log(`Location: ${earthquake.place}`);
    console.log(`Time: ${new Date(earthquake.time).toLocaleString('en-PH')}`);
    console.log('---');

    // TODO: In production, save to Firebase/Firestore
    // await addDoc(collection(db, 'alerts'), {
    //   magnitude: earthquake.magnitude,
    //   place: earthquake.place,
    //   time: earthquake.time,
    //   timestamp: serverTimestamp()
    // });
  }

  /**
   * Subscribe to alerts using Firebase (mock implementation)
   */
  subscribeAlerts(threshold: number, location: string): void {
    console.log('Alert Subscription (Firebase):');
    console.log(`Threshold: M${threshold}+`);
    console.log(`Location: ${location}`);

    // In production, this would save to Firebase/Firestore
    localStorage.setItem('alert_subscription', JSON.stringify({
      threshold,
      location,
      subscribedAt: Date.now(),
    }));

    this.showAlert('✅ Successfully subscribed to alerts!', 'info');
  }
}

export const alertService = new AlertService();
