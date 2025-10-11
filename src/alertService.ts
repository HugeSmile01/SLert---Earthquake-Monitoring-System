import type { Earthquake } from './types';

class AlertService {
  private alertBanner: HTMLElement | null = null;
  private alertMessage: HTMLElement | null = null;

  /**
   * Initialize the alert service
   */
  init(): void {
    this.alertBanner = document.getElementById('alert-banner');
    this.alertMessage = document.getElementById('alert-message');
  }

  /**
   * Show an alert banner
   */
  showAlert(message: string, type: 'info' | 'warning' | 'danger' = 'danger'): void {
    if (!this.alertBanner || !this.alertMessage) return;

    this.alertMessage.textContent = message;
    
    // Set color based on type
    this.alertBanner.classList.remove('bg-alert-red', 'bg-warning-yellow', 'bg-blue-600');
    switch (type) {
      case 'danger':
        this.alertBanner.classList.add('bg-alert-red');
        break;
      case 'warning':
        this.alertBanner.classList.add('bg-warning-yellow', 'text-gray-900');
        break;
      case 'info':
        this.alertBanner.classList.add('bg-blue-600');
        break;
    }

    this.alertBanner.classList.remove('hidden');
  }

  /**
   * Hide the alert banner
   */
  hideAlert(): void {
    if (!this.alertBanner) return;
    this.alertBanner.classList.add('hidden');
  }

  /**
   * Check for significant earthquakes and show alerts
   */
  checkForAlerts(earthquakes: Earthquake[]): void {
    // Check for recent significant earthquakes (last 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const recentSignificant = earthquakes.filter(
      eq => eq.time >= fiveMinutesAgo && eq.magnitude >= 5.0
    );

    if (recentSignificant.length > 0) {
      const strongest = recentSignificant.reduce((prev, current) => 
        current.magnitude > prev.magnitude ? current : prev
      );
      
      const message = `⚠️ Earthquake Alert: M${strongest.magnitude.toFixed(1)} detected ${strongest.place}`;
      this.showAlert(message, 'danger');
      
      // Simulate SMS alert
      this.simulateSMSAlert(strongest);
    }
  }

  /**
   * Simulate SMS alert (in production, this would call Twilio/Semaphore API)
   */
  private simulateSMSAlert(earthquake: Earthquake): void {
    console.log('📱 SMS Alert Sent:');
    console.log(`Magnitude ${earthquake.magnitude.toFixed(1)} earthquake detected`);
    console.log(`Location: ${earthquake.place}`);
    console.log(`Time: ${new Date(earthquake.time).toLocaleString('en-PH')}`);
    console.log('---');
    
    // In production, this would be:
    // await twilioClient.messages.create({
    //   body: `EARTHQUAKE ALERT: M${earthquake.magnitude} detected ${earthquake.place}. Stay safe!`,
    //   to: subscribedPhoneNumbers,
    //   from: twilioPhoneNumber
    // });
  }

  /**
   * Subscribe to SMS alerts (mock implementation)
   */
  subscribeSMS(phoneNumber: string, threshold: number, location: string): void {
    console.log('SMS Alert Subscription:');
    console.log(`Phone: ${phoneNumber}`);
    console.log(`Threshold: M${threshold}+`);
    console.log(`Location: ${location}`);
    
    // In production, this would save to Firebase/Firestore
    localStorage.setItem('sms_subscription', JSON.stringify({
      phoneNumber,
      threshold,
      location,
      subscribedAt: Date.now(),
    }));

    this.showAlert('✅ Successfully subscribed to SMS alerts!', 'info');
    setTimeout(() => this.hideAlert(), 5000);
  }
}

export const alertService = new AlertService();
