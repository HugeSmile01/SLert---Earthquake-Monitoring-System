class ThemeService {
  private currentTheme: 'light' | 'dark' = 'light';
  private readonly STORAGE_KEY = 'earthquake-theme';

  init(): void {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem(this.STORAGE_KEY) as 'light' | 'dark' | null;
    
    if (savedTheme) {
      this.currentTheme = savedTheme;
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme = prefersDark ? 'dark' : 'light';
    }

    this.applyTheme();
    console.log('Theme service initialized. Current theme:', this.currentTheme);
  }

  toggle(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme();
    this.saveTheme();
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme = theme;
    this.applyTheme();
    this.saveTheme();
  }

  getTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  private applyTheme(): void {
    const root = document.documentElement;
    
    if (this.currentTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Update meta theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', this.currentTheme === 'dark' ? '#1f2937' : '#003366');
    }
  }

  private saveTheme(): void {
    localStorage.setItem(this.STORAGE_KEY, this.currentTheme);
  }
}

export const themeService = new ThemeService();
