import type { Earthquake } from './types';

class ShareService {
  isSupported(): boolean {
    try {
      return typeof navigator !== 'undefined' && 'share' in navigator;
    } catch (error) {
      console.error('Error checking share support:', error);
      return false;
    }
  }

  async shareEarthquake(earthquake: Earthquake): Promise<void> {
    try {
      if (!earthquake) {
        throw new Error('Invalid earthquake data');
      }

      if (!this.isSupported()) {
        try {
          this.copyToClipboard(this.generateShareableLink(earthquake));
          alert('Link copied to clipboard!');
        } catch (copyError) {
          console.error('Error copying to clipboard:', copyError);
          throw new Error('Failed to share earthquake data');
        }
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
      } catch (shareError) {
        if ((shareError as Error).name !== 'AbortError') {
          console.error('❌ Error sharing:', shareError);
          try {
            this.copyToClipboard(shareData.url);
            alert('Link copied to clipboard!');
          } catch (fallbackError) {
            throw new Error('Failed to share or copy link');
          }
        }
      }
    } catch (error) {
      console.error('Error in shareEarthquake:', error);
      throw error;
    }
  }

  private generateShareableLink(earthquake: Earthquake): string {
    try {
      if (!earthquake) {
        throw new Error('Invalid earthquake data');
      }

      if (earthquake.url) {
        return earthquake.url;
      }
      
      if (typeof window === 'undefined') {
        throw new Error('Window object not available');
      }

      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}#earthquake-${earthquake.id}`;
    } catch (error) {
      console.error('Error generating shareable link:', error);
      return '';
    }
  }

  private copyToClipboard(text: string): void {
    try {
      if (!text) {
        throw new Error('No text to copy');
      }

      if (typeof navigator === 'undefined') {
        throw new Error('Navigator not available');
      }

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(error => {
          console.error('Clipboard write failed:', error);
          this.fallbackCopyToClipboard(text);
        });
      } else {
        this.fallbackCopyToClipboard(text);
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      throw error;
    }
  }

  private fallbackCopyToClipboard(text: string): void {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        document.execCommand('copy');
      } catch (execError) {
        console.error('execCommand copy failed:', execError);
        throw new Error('Failed to copy text');
      } finally {
        document.body.removeChild(textarea);
      }
    } catch (error) {
      console.error('Error in fallback copy:', error);
      throw error;
    }
  }

  async shareSystemStatus(stats: { last24h: number; last7d: number; strongest: string }): Promise<void> {
    try {
      if (!stats) {
        throw new Error('Invalid stats data');
      }

      if (!this.isSupported()) {
        alert('Web Share API is not supported in this browser');
        return;
      }

      const shareData = {
        title: 'Southern Leyte Earthquake Alert System',
        text: `Last 24h: ${stats.last24h} | Last 7d: ${stats.last7d} | Strongest: ${stats.strongest}`,
        url: typeof window !== 'undefined' ? window.location.href : '',
      };

      try {
        await navigator.share(shareData);
        console.log('✅ System status shared successfully');
      } catch (shareError) {
        if ((shareError as Error).name !== 'AbortError') {
          console.error('❌ Error sharing:', shareError);
          throw shareError;
        }
      }
    } catch (error) {
      console.error('Error sharing system status:', error);
      throw error;
    }
  }
}

export const shareService = new ShareService();
