import { db, auth } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment,
  deleteDoc
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import type { CommunityNews, EarthquakeReport, Comment } from './types';

/**
 * Service for community features: news, reports, and comments
 */
class CommunityService {
  private currentUser: User | null = null;
  private userPostsToday: number = 0;
  private readonly MAX_POSTS_PER_DAY = 2;

  /**
   * Initialize community service and anonymous auth
   */
  async init(): Promise<void> {
    if (!auth) {
      console.warn('⚠️ Firebase Auth not initialized. Community features disabled.');
      return;
    }

    try {
      // Setup auth state listener
      onAuthStateChanged(auth, (user) => {
        this.currentUser = user;
        if (user) {
          console.log('✅ User authenticated:', user.uid);
          this.checkUserPostsToday();
        }
      });

      // Sign in anonymously if not already signed in
      if (!auth.currentUser) {
        await signInAnonymously(auth);
        console.log('✅ Anonymous authentication successful');
      }
    } catch (error) {
      console.error('❌ Error initializing community service:', error);
    }
  }

  /**
   * Check how many posts user has made today
   */
  private async checkUserPostsToday(): Promise<void> {
    if (!this.currentUser || !db) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    try {
      const newsRef = collection(db, 'communityNews');
      const q = query(
        newsRef,
        where('userId', '==', this.currentUser.uid),
        where('timestamp', '>=', todayTimestamp)
      );
      const snapshot = await getDocs(q);
      this.userPostsToday = snapshot.size;
    } catch (error) {
      console.error('Error checking user posts:', error);
    }
  }

  /**
   * Check if user can post today
   */
  canPostToday(): boolean {
    return this.userPostsToday < this.MAX_POSTS_PER_DAY;
  }

  /**
   * Get remaining posts for today
   */
  getRemainingPosts(): number {
    return Math.max(0, this.MAX_POSTS_PER_DAY - this.userPostsToday);
  }

  /**
   * Post community news
   */
  async postNews(content: string, userName?: string): Promise<string> {
    if (!this.currentUser || !db) {
      throw new Error('User not authenticated or Firestore not initialized');
    }

    if (!this.canPostToday()) {
      throw new Error('Daily post limit reached (2 posts per day)');
    }

    if (content.length < 10 || content.length > 500) {
      throw new Error('Content must be between 10 and 500 characters');
    }

    try {
      const newsData = {
        userId: this.currentUser.uid,
        userName: userName || 'Anonymous',
        content,
        timestamp: Date.now(),
        hearts: 0,
        heartedBy: [],
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'communityNews'), newsData);
      this.userPostsToday++;
      console.log('✅ News posted successfully');
      return docRef.id;
    } catch (error) {
      console.error('❌ Error posting news:', error);
      throw error;
    }
  }

  /**
   * Get community news
   */
  async getNews(limitCount: number = 20): Promise<CommunityNews[]> {
    if (!db) {
      console.warn('⚠️ Firestore not initialized');
      return [];
    }

    try {
      const newsRef = collection(db, 'communityNews');
      const q = query(newsRef, orderBy('timestamp', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CommunityNews));
    } catch (error) {
      console.error('❌ Error fetching news:', error);
      return [];
    }
  }

  /**
   * Toggle heart on news post
   */
  async toggleHeart(newsId: string): Promise<void> {
    if (!this.currentUser || !db) {
      throw new Error('User not authenticated or Firestore not initialized');
    }

    try {
      const newsRef = doc(db, 'communityNews', newsId);
      const newsDoc = await getDocs(query(collection(db, 'communityNews'), where('__name__', '==', newsId)));
      
      if (newsDoc.empty) {
        throw new Error('News post not found');
      }

      const newsData = newsDoc.docs[0].data() as CommunityNews;
      const hasHearted = newsData.heartedBy?.includes(this.currentUser.uid);

      if (hasHearted) {
        // Remove heart
        await updateDoc(newsRef, {
          hearts: increment(-1),
          heartedBy: newsData.heartedBy.filter(id => id !== this.currentUser!.uid)
        });
      } else {
        // Add heart
        await updateDoc(newsRef, {
          hearts: increment(1),
          heartedBy: [...(newsData.heartedBy || []), this.currentUser.uid]
        });
      }

      console.log('✅ Heart toggled successfully');
    } catch (error) {
      console.error('❌ Error toggling heart:', error);
      throw error;
    }
  }

  /**
   * Submit earthquake report
   */
  async submitReport(earthquakeId: string, experience: string, intensity: number, userName?: string): Promise<string> {
    if (!this.currentUser || !db) {
      throw new Error('User not authenticated or Firestore not initialized');
    }

    if (experience.length < 10 || experience.length > 1000) {
      throw new Error('Experience must be between 10 and 1000 characters');
    }

    if (intensity < 1 || intensity > 10) {
      throw new Error('Intensity must be between 1 and 10');
    }

    try {
      const reportData = {
        earthquakeId,
        userId: this.currentUser.uid,
        userName: userName || 'Anonymous',
        experience,
        intensity,
        timestamp: Date.now(),
        upvotes: 0,
        downvotes: 0,
        votedBy: {},
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'earthquakeReports'), reportData);
      console.log('✅ Report submitted successfully');
      return docRef.id;
    } catch (error) {
      console.error('❌ Error submitting report:', error);
      throw error;
    }
  }

  /**
   * Get reports for an earthquake
   */
  async getReports(earthquakeId: string): Promise<EarthquakeReport[]> {
    if (!db) {
      console.warn('⚠️ Firestore not initialized');
      return [];
    }

    try {
      const reportsRef = collection(db, 'earthquakeReports');
      const q = query(
        reportsRef,
        where('earthquakeId', '==', earthquakeId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EarthquakeReport));
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      return [];
    }
  }

  /**
   * Vote on a report
   */
  async voteOnReport(reportId: string, voteType: 'up' | 'down'): Promise<void> {
    if (!this.currentUser || !db) {
      throw new Error('User not authenticated or Firestore not initialized');
    }

    try {
      const reportRef = doc(db, 'earthquakeReports', reportId);
      const reportDoc = await getDocs(query(collection(db, 'earthquakeReports'), where('__name__', '==', reportId)));
      
      if (reportDoc.empty) {
        throw new Error('Report not found');
      }

      const reportData = reportDoc.docs[0].data() as EarthquakeReport;
      const previousVote = reportData.votedBy?.[this.currentUser.uid];

      const updates: any = {
        votedBy: {
          ...reportData.votedBy,
          [this.currentUser.uid]: voteType
        }
      };

      // Adjust vote counts
      if (previousVote === 'up' && voteType === 'down') {
        updates.upvotes = increment(-1);
        updates.downvotes = increment(1);
      } else if (previousVote === 'down' && voteType === 'up') {
        updates.downvotes = increment(-1);
        updates.upvotes = increment(1);
      } else if (!previousVote) {
        if (voteType === 'up') {
          updates.upvotes = increment(1);
        } else {
          updates.downvotes = increment(1);
        }
      }

      await updateDoc(reportRef, updates);
      console.log('✅ Vote recorded successfully');
    } catch (error) {
      console.error('❌ Error voting on report:', error);
      throw error;
    }
  }

  /**
   * Post a comment
   */
  async postComment(earthquakeId: string, content: string, userName?: string): Promise<string> {
    if (!this.currentUser || !db) {
      throw new Error('User not authenticated or Firestore not initialized');
    }

    if (content.length < 1 || content.length > 500) {
      throw new Error('Comment must be between 1 and 500 characters');
    }

    try {
      const commentData = {
        earthquakeId,
        userId: this.currentUser.uid,
        userName: userName || 'Anonymous',
        content,
        timestamp: Date.now(),
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'earthquakeComments'), commentData);
      console.log('✅ Comment posted successfully');
      return docRef.id;
    } catch (error) {
      console.error('❌ Error posting comment:', error);
      throw error;
    }
  }

  /**
   * Get comments for an earthquake
   */
  async getComments(earthquakeId: string): Promise<Comment[]> {
    if (!db) {
      console.warn('⚠️ Firestore not initialized');
      return [];
    }

    try {
      const commentsRef = collection(db, 'earthquakeComments');
      const q = query(
        commentsRef,
        where('earthquakeId', '==', earthquakeId),
        orderBy('timestamp', 'asc')
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Comment));
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
      return [];
    }
  }

  /**
   * Delete a comment (only by the author)
   */
  async deleteComment(commentId: string): Promise<void> {
    if (!this.currentUser || !db) {
      throw new Error('User not authenticated or Firestore not initialized');
    }

    try {
      const commentRef = doc(db, 'earthquakeComments', commentId);
      const commentDoc = await getDocs(query(collection(db, 'earthquakeComments'), where('__name__', '==', commentId)));
      
      if (commentDoc.empty) {
        throw new Error('Comment not found');
      }

      const commentData = commentDoc.docs[0].data() as Comment;
      if (commentData.userId !== this.currentUser.uid) {
        throw new Error('You can only delete your own comments');
      }

      await deleteDoc(commentRef);
      console.log('✅ Comment deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      throw error;
    }
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): string | null {
    return this.currentUser?.uid || null;
  }
}

export const communityService = new CommunityService();
