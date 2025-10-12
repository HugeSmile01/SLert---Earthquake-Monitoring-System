import type { Earthquake } from './types';

/**
 * Service for sharing earthquake data using Web Share API
 */
class ShareService {
  /**
   * Check if Web Share API is supported
   */
  isSupported(): boolean {
    return 'share' in navigator;
  }

  /**
   * Share earthquake data
   */
  async shareEarthquake(earthquake: Earthquake): Promise<void> {
    if (!this.isSupported()) {
      // Fallback to copying link
      this.copyToClipboard(this.generateShareableLink(earthquake));
      alert('Link copied to clipboard!');
      return;
    }

    const shareData = {
      title: `Magnitude ${earthquake.magnitude.toFixed(1)} Earthquake`,
      text: `${earthquake.place} - ${new Date(earthquake.time).toLocaleString('en-PH')}`,
      url: this.generateShareableLink(earthquake),
    };

    try {
      await navigator.share(shareData);
      console.log('✅ Earthquake data shared successfully');
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('❌ Error sharing:', error);
        // Fallback to copying link
        this.copyToClipboard(shareData.url);
        alert('Link copied to clipboard!');
      }
    }
  }

  /**
   * Generate a shareable link for an earthquake
   */
  private generateShareableLink(earthquake: Earthquake): string {
    // Use USGS URL if available, otherwise use current page with earthquake ID
    if (earthquake.url) {
      return earthquake.url;
    }
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#earthquake-${earthquake.id}`;
  }

  /**
   * Copy text to clipboard
   */
  private copyToClipboard(text: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  /**
   * Share system status
   */
  async shareSystemStatus(stats: { last24h: number; last7d: number; strongest: string }): Promise<void> {
    if (!this.isSupported()) {
      alert('Web Share API is not supported in this browser');
      return;
    }

    const shareData = {
      title: 'Southern Leyte Earthquake Alert System',
      text: `Last 24h: ${stats.last24h} | Last 7d: ${stats.last7d} | Strongest: ${stats.strongest}`,
      url: window.location.href,
    };

    try {
      await navigator.share(shareData);
      console.log('✅ System status shared successfully');
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('❌ Error sharing:', error);
      }
    }
  }
}

export const shareService = new ShareService();
