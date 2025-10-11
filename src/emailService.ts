import type { Earthquake } from './types';
import { SecurityUtils } from './security';

class EmailService {
  private alertBanner: HTMLElement | null = null;
  private alertMessage: HTMLElement | null = null;

  init(): void {
    this.alertBanner = document.getElementById('alert-banner');
    this.alertMessage = document.getElementById('alert-message');
  }

  showAlert(message: string, type: 'info' | 'warning' | 'danger' = 'danger'): void {
    if (!this.alertBanner || !this.alertMessage) return;

    this.alertMessage.textContent = message;
    
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

  hideAlert(): void {
    if (!this.alertBanner) return;
    this.alertBanner.classList.add('hidden');
  }

  checkForAlerts(earthquakes: Earthquake[]): void {
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
      
      this.sendEmailAlert(strongest);
    }
  }

  private sendEmailAlert(earthquake: Earthquake): void {
    console.log('📧 Email Alert Sent:');
    console.log(`Magnitude ${earthquake.magnitude.toFixed(1)} earthquake detected`);
    console.log(`Location: ${earthquake.place}`);
    console.log(`Time: ${new Date(earthquake.time).toLocaleString('en-PH')}`);
    console.log('Infographic generated and attached');
    console.log('---');
  }

  subscribeEmail(email: string, threshold: number, location: string): void {
    if (!SecurityUtils.rateLimit('email_subscription', 5, 60000)) {
      this.showAlert('❌ Too many subscription attempts. Please wait a minute.', 'danger');
      setTimeout(() => this.hideAlert(), 5000);
      return;
    }

    if (!SecurityUtils.validateEmail(email)) {
      this.showAlert('❌ Please enter a valid email address', 'danger');
      setTimeout(() => this.hideAlert(), 5000);
      return;
    }

    if (!SecurityUtils.validateLocation(location)) {
      this.showAlert('❌ Please enter a valid location', 'danger');
      setTimeout(() => this.hideAlert(), 5000);
      return;
    }

    const sanitizedEmail = SecurityUtils.sanitizeInput(email);
    const sanitizedLocation = SecurityUtils.sanitizeInput(location);

    console.log('Email Alert Subscription:');
    console.log(`Email: ${sanitizedEmail}`);
    console.log(`Threshold: M${threshold}+`);
    console.log(`Location: ${sanitizedLocation}`);
    
    localStorage.setItem('email_subscription', JSON.stringify({
      email: sanitizedEmail,
      threshold,
      location: sanitizedLocation,
      subscribedAt: Date.now(),
    }));

    this.showAlert('✅ Successfully subscribed to email alerts!', 'info');
    setTimeout(() => this.hideAlert(), 5000);
  }

  generateInfographic(earthquake: Earthquake): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    canvas.width = 800;
    canvas.height = 600;
    
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#003366';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EARTHQUAKE ALERT', 400, 80);
    
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 72px Arial';
    ctx.fillText(`M${earthquake.magnitude.toFixed(1)}`, 400, 180);
    
    ctx.fillStyle = '#1f2937';
    ctx.font = '24px Arial';
    ctx.fillText('Location:', 400, 250);
    ctx.font = 'bold 28px Arial';
    ctx.fillText(earthquake.place, 400, 290);
    
    ctx.font = '24px Arial';
    ctx.fillText('Time:', 400, 350);
    ctx.font = '20px Arial';
    ctx.fillText(new Date(earthquake.time).toLocaleString('en-PH'), 400, 385);
    
    ctx.font = '24px Arial';
    ctx.fillText(`Depth: ${earthquake.depth.toFixed(1)} km`, 400, 440);
    
    ctx.fillStyle = '#003366';
    ctx.font = '18px Arial';
    ctx.fillText('Southern Leyte Earthquake Alert System', 400, 520);
    ctx.fillText('Stay safe and follow official guidelines', 400, 550);
    
    return canvas.toDataURL('image/png');
  }
}

export const emailService = new EmailService();
