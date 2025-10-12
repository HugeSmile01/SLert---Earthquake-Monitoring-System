import { userAuthService } from './userAuthService';
import Swal from 'sweetalert2';

/**
 * Service to manage sidebar UI and interactions
 */
class SidebarService {
  private sidebarElement: HTMLElement | null = null;
  private overlayElement: HTMLElement | null = null;
  private isInitialized = false;

  /**
   * Initialize the sidebar
   */
  init(): void {
    if (this.isInitialized) return;

    this.sidebarElement = document.getElementById('user-sidebar');
    this.overlayElement = document.getElementById('sidebar-overlay');

    if (!this.sidebarElement || !this.overlayElement) {
      console.warn('Sidebar elements not found');
      return;
    }

    this.setupEventListeners();
    this.updateSidebarContent();

    // Listen to auth state changes
    userAuthService.onAuthStateChange(() => {
      this.updateSidebarContent();
    });

    this.isInitialized = true;
  }

  /**
   * Setup event listeners for sidebar
   */
  private setupEventListeners(): void {
    // Open sidebar button
    const openBtn = document.getElementById('open-sidebar-btn');
    if (openBtn) {
      openBtn.addEventListener('click', () => this.openSidebar());
    }

    // Close sidebar button
    const closeBtn = document.getElementById('close-sidebar-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeSidebar());
    }

    // Overlay click
    if (this.overlayElement) {
      this.overlayElement.addEventListener('click', () => this.closeSidebar());
    }

    // Login form
    const loginForm = document.getElementById('user-login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Signup form
    const signupForm = document.getElementById('user-signup-form');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => this.handleSignup(e));
    }

    // Show signup form button
    const showSignupBtn = document.getElementById('show-signup-btn');
    if (showSignupBtn) {
      showSignupBtn.addEventListener('click', () => this.showSignupForm());
    }

    // Show login form button
    const showLoginBtn = document.getElementById('show-login-btn');
    if (showLoginBtn) {
      showLoginBtn.addEventListener('click', () => this.showLoginForm());
    }

    // Logout button
    const logoutBtn = document.getElementById('user-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }
  }

  /**
   * Open the sidebar
   */
  openSidebar(): void {
    if (this.sidebarElement && this.overlayElement) {
      this.sidebarElement.classList.remove('translate-x-full');
      this.overlayElement.classList.remove('hidden');
    }
  }

  /**
   * Close the sidebar
   */
  closeSidebar(): void {
    if (this.sidebarElement && this.overlayElement) {
      this.sidebarElement.classList.add('translate-x-full');
      this.overlayElement.classList.add('hidden');
    }
  }

  /**
   * Update sidebar content based on auth state
   */
  private updateSidebarContent(): void {
    const loginSection = document.getElementById('sidebar-login-section');
    const signupSection = document.getElementById('sidebar-signup-section');
    const userSection = document.getElementById('sidebar-user-section');
    const userNameDisplay = document.getElementById('user-display-name');

    if (userAuthService.isLoggedIn()) {
      // Show user section, hide login/signup
      if (loginSection) loginSection.classList.add('hidden');
      if (signupSection) signupSection.classList.add('hidden');
      if (userSection) userSection.classList.remove('hidden');
      if (userNameDisplay) {
        userNameDisplay.textContent = userAuthService.getUserDisplayName();
      }
    } else {
      // Show login section, hide user section
      if (loginSection) loginSection.classList.remove('hidden');
      if (signupSection) signupSection.classList.add('hidden');
      if (userSection) userSection.classList.add('hidden');
    }
  }

  /**
   * Show signup form
   */
  private showSignupForm(): void {
    const loginSection = document.getElementById('sidebar-login-section');
    const signupSection = document.getElementById('sidebar-signup-section');
    
    if (loginSection) loginSection.classList.add('hidden');
    if (signupSection) signupSection.classList.remove('hidden');
  }

  /**
   * Show login form
   */
  private showLoginForm(): void {
    const loginSection = document.getElementById('sidebar-login-section');
    const signupSection = document.getElementById('sidebar-signup-section');
    
    if (loginSection) loginSection.classList.remove('hidden');
    if (signupSection) signupSection.classList.add('hidden');
  }

  /**
   * Handle login form submission
   */
  private async handleLogin(e: Event): Promise<void> {
    e.preventDefault();

    const emailInput = document.getElementById('user-login-email') as HTMLInputElement;
    const passwordInput = document.getElementById('user-login-password') as HTMLInputElement;

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    try {
      // Show loading and start login concurrently
      const loginPromise = userAuthService.login(email, password);
      
      Swal.fire({
        title: 'Logging in...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await loginPromise;

      await Swal.fire({
        icon: 'success',
        title: 'Login Successful',
        text: `Welcome back, ${userAuthService.getUserDisplayName()}!`,
        timer: 2000,
        showConfirmButton: false
      });

      // Clear form
      emailInput.value = '';
      passwordInput.value = '';

      this.closeSidebar();
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: (error as Error).message || 'Invalid credentials',
      });
    }
  }

  /**
   * Handle signup form submission
   */
  private async handleSignup(e: Event): Promise<void> {
    e.preventDefault();

    const nameInput = document.getElementById('user-signup-name') as HTMLInputElement;
    const emailInput = document.getElementById('user-signup-email') as HTMLInputElement;
    const passwordInput = document.getElementById('user-signup-password') as HTMLInputElement;
    const confirmPasswordInput = document.getElementById('user-signup-confirm-password') as HTMLInputElement;

    if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput) return;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validate passwords match
    if (password !== confirmPassword) {
      await Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match. Please try again.',
      });
      return;
    }

    try {
      // Show loading and start signup concurrently
      const signupPromise = userAuthService.signup(email, password, name);
      
      Swal.fire({
        title: 'Creating account...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await signupPromise;

      await Swal.fire({
        icon: 'success',
        title: 'Account Created',
        text: `Welcome, ${name}! Your account has been created successfully.`,
        timer: 2000,
        showConfirmButton: false
      });

      // Clear form
      nameInput.value = '';
      emailInput.value = '';
      passwordInput.value = '';
      confirmPasswordInput.value = '';

      this.closeSidebar();
    } catch (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Signup Failed',
        text: (error as Error).message || 'Failed to create account',
      });
    }
  }

  /**
   * Handle logout
   */
  private async handleLogout(): Promise<void> {
    try {
      await userAuthService.logout();

      await Swal.fire({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have been logged out successfully',
        timer: 2000,
        showConfirmButton: false
      });

      this.closeSidebar();
    } catch (error) {
      console.error('Logout error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Logout Failed',
        text: 'Failed to logout. Please try again.',
      });
    }
  }
}

export const sidebarService = new SidebarService();
