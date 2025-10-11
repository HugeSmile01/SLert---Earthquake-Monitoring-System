export class SecurityUtils {
  static sanitizeInput(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  static validateLocation(location: string): boolean {
    const sanitized = this.sanitizeInput(location);
    return sanitized.length > 0 && sanitized.length <= 100 && /^[a-zA-Z\s,.-]+$/.test(sanitized);
  }

  static rateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempts = JSON.parse(localStorage.getItem(`rateLimit_${key}`) || '[]') as number[];
    
    const recentAttempts = attempts.filter(timestamp => now - timestamp < windowMs);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    localStorage.setItem(`rateLimit_${key}`, JSON.stringify(recentAttempts));
    
    return true;
  }

  static enforceHTTPS(): void {
    if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }
  }

  static getCSPMetaTag(): string {
    return `default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https://*.openstreetmap.org; connect-src 'self' https://earthquake.usgs.gov; font-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';`;
  }
}
