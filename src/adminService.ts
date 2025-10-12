import { db, auth } from './firebase';
import { 
  collection, 
  doc, 
  updateDoc, 
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc
} from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';

/**
 * Admin service for system management
 * Only accessible to admin@johnrish.website
 */
class AdminService {
  private readonly ADMIN_EMAIL = 'admin@johnrish.website';
  private currentUser: User | null = null;
  private isAdmin: boolean = false;

  /**
   * Initialize admin service
   */
  init(): void {
    if (!auth) {
      console.warn('⚠️ Firebase Auth not initialized. Admin features disabled.');
      return;
    }

    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.isAdmin = user?.email === this.ADMIN_EMAIL;
      
      if (this.isAdmin) {
        console.log('✅ Admin authenticated');
      }
    });
  }

  /**
   * Check if current user is admin
   */
  isAdminUser(): boolean {
    return this.isAdmin;
  }

  /**
   * Admin login
   */
  async login(email: string, password: string): Promise<void> {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    if (email !== this.ADMIN_EMAIL) {
      throw new Error('Unauthorized: Only admin@johnrish.website can access admin portal');
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Admin logged in successfully');
    } catch (error) {
      console.error('❌ Admin login failed:', error);
      throw new Error('Invalid credentials');
    }
  }

  /**
   * Admin logout
   */
  async logout(): Promise<void> {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    try {
      await signOut(auth);
      this.isAdmin = false;
      console.log('✅ Admin logged out successfully');
    } catch (error) {
      console.error('❌ Admin logout failed:', error);
      throw error;
    }
  }

  /**
   * Update earthquake magnitude (admin only)
   */
  async updateEarthquakeMagnitude(earthquakeId: string, newMagnitude: number, reason?: string): Promise<void> {
    if (!this.isAdmin || !db) {
      throw new Error('Unauthorized: Admin access required');
    }

    if (newMagnitude < 0 || newMagnitude > 10) {
      throw new Error('Invalid magnitude: Must be between 0 and 10');
    }

    try {
      // Store the edit in Firestore
      const editRef = doc(db, 'earthquakeEdits', earthquakeId);
      await updateDoc(editRef, {
        originalMagnitude: newMagnitude, // This would be fetched from the original data
        editedMagnitude: newMagnitude,
        editedBy: this.currentUser?.email,
        editedAt: Date.now(),
        reason: reason || 'No reason provided',
        editedByAdmin: true
      }).catch(async () => {
        // If document doesn't exist, create it
        const { setDoc } = await import('firebase/firestore');
        await setDoc(editRef, {
          earthquakeId,
          editedMagnitude: newMagnitude,
          editedBy: this.currentUser?.email,
          editedAt: Date.now(),
          reason: reason || 'No reason provided',
          editedByAdmin: true
        });
      });

      console.log('✅ Earthquake magnitude updated successfully');
    } catch (error) {
      console.error('❌ Error updating earthquake magnitude:', error);
      throw error;
    }
  }

  /**
   * Get earthquake edits
   */
  async getEarthquakeEdit(earthquakeId: string): Promise<any | null> {
    if (!db) {
      console.warn('⚠️ Firestore not initialized');
      return null;
    }

    try {
      const editRef = doc(db, 'earthquakeEdits', earthquakeId);
      const editDoc = await getDoc(editRef);

      if (editDoc.exists()) {
        return { id: editDoc.id, ...editDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('❌ Error fetching earthquake edit:', error);
      return null;
    }
  }

  /**
   * Get all earthquake edits
   */
  async getAllEarthquakeEdits(): Promise<any[]> {
    if (!this.isAdmin || !db) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const editsRef = collection(db, 'earthquakeEdits');
      const q = query(editsRef, orderBy('editedAt', 'desc'), limit(100));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('❌ Error fetching earthquake edits:', error);
      return [];
    }
  }

  /**
   * Delete community news post (admin only)
   */
  async deleteNewsPost(newsId: string): Promise<void> {
    if (!this.isAdmin || !db) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      await deleteDoc(doc(db, 'communityNews', newsId));
      console.log('✅ News post deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting news post:', error);
      throw error;
    }
  }

  /**
   * Delete earthquake report (admin only)
   */
  async deleteReport(reportId: string): Promise<void> {
    if (!this.isAdmin || !db) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      await deleteDoc(doc(db, 'earthquakeReports', reportId));
      console.log('✅ Report deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting report:', error);
      throw error;
    }
  }

  /**
   * Delete comment (admin only)
   */
  async deleteComment(commentId: string): Promise<void> {
    if (!this.isAdmin || !db) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      await deleteDoc(doc(db, 'earthquakeComments', commentId));
      console.log('✅ Comment deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      throw error;
    }
  }

  /**
   * Get system statistics (admin only)
   */
  async getSystemStats(): Promise<any> {
    if (!this.isAdmin || !db) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const [newsSnapshot, reportsSnapshot, commentsSnapshot] = await Promise.all([
        getDocs(collection(db, 'communityNews')),
        getDocs(collection(db, 'earthquakeReports')),
        getDocs(collection(db, 'earthquakeComments'))
      ]);

      return {
        totalNews: newsSnapshot.size,
        totalReports: reportsSnapshot.size,
        totalComments: commentsSnapshot.size,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('❌ Error fetching system stats:', error);
      throw error;
    }
  }

  /**
   * Get recent activity (admin only)
   */
  async getRecentActivity(limitCount: number = 20): Promise<any[]> {
    if (!this.isAdmin || !db) {
      throw new Error('Unauthorized: Admin access required');
    }

    try {
      const activities: any[] = [];

      // Get recent news
      const newsRef = collection(db, 'communityNews');
      const newsQuery = query(newsRef, orderBy('timestamp', 'desc'), limit(limitCount));
      const newsSnapshot = await getDocs(newsQuery);
      newsSnapshot.forEach(doc => {
        activities.push({
          type: 'news',
          id: doc.id,
          ...doc.data()
        });
      });

      // Get recent reports
      const reportsRef = collection(db, 'earthquakeReports');
      const reportsQuery = query(reportsRef, orderBy('timestamp', 'desc'), limit(limitCount));
      const reportsSnapshot = await getDocs(reportsQuery);
      reportsSnapshot.forEach(doc => {
        activities.push({
          type: 'report',
          id: doc.id,
          ...doc.data()
        });
      });

      // Get recent comments
      const commentsRef = collection(db, 'earthquakeComments');
      const commentsQuery = query(commentsRef, orderBy('timestamp', 'desc'), limit(limitCount));
      const commentsSnapshot = await getDocs(commentsQuery);
      commentsSnapshot.forEach(doc => {
        activities.push({
          type: 'comment',
          id: doc.id,
          ...doc.data()
        });
      });

      // Sort by timestamp
      activities.sort((a, b) => b.timestamp - a.timestamp);

      return activities.slice(0, limitCount);
    } catch (error) {
      console.error('❌ Error fetching recent activity:', error);
      return [];
    }
  }

  /**
   * Get current admin email
   */
  getAdminEmail(): string {
    return this.ADMIN_EMAIL;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }
}

export const adminService = new AdminService();
