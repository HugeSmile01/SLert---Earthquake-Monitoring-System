import { auth } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User,
  updateProfile
} from 'firebase/auth';

/**
 * User authentication service for regular users
 * Handles signup, login, and logout functionality
 */
class UserAuthService {
  private currentUser: User | null = null;
  private authStateCallbacks: ((user: User | null) => void)[] = [];

  /**
   * Initialize user auth service
   */
  init(): void {
    if (!auth) {
      console.warn('⚠️ Firebase Auth not initialized. User authentication disabled.');
      return;
    }

    // Setup auth state listener
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      console.log('User auth state changed:', user ? user.email : 'not logged in');
      
      // Notify all callbacks
      this.authStateCallbacks.forEach(callback => callback(user));
    });
  }

  /**
   * Register a callback for auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void): void {
    this.authStateCallbacks.push(callback);
    // Call immediately with current state
    callback(this.currentUser);
  }

  /**
   * Sign up a new user
   */
  async signup(email: string, password: string, displayName?: string): Promise<void> {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      console.log('✅ User signed up successfully:', email);
    } catch (error: unknown) {
      console.error('❌ Signup failed:', error);
      
      // Provide user-friendly error messages
      const authError = error as { code?: string };
      if (authError.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered. Please login instead.');
      } else if (authError.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters.');
      } else if (authError.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else {
        throw new Error('Signup failed. Please try again.');
      }
    }
  }

  /**
   * Login an existing user
   */
  async login(email: string, password: string): Promise<void> {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ User logged in successfully:', email);
    } catch (error: unknown) {
      console.error('❌ Login failed:', error);
      
      // Provide user-friendly error messages
      const authError = error as { code?: string };
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password.');
      } else if (authError.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (authError.code === 'auth/invalid-credential') {
        throw new Error('Invalid email or password.');
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    try {
      await signOut(auth);
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Get user display name or email
   */
  getUserDisplayName(): string {
    if (!this.currentUser) return 'Guest';
    return this.currentUser.displayName || this.currentUser.email || 'User';
  }
}

export const userAuthService = new UserAuthService();
