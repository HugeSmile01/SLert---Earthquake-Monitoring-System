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

class CommunityService {
  private currentUser: User | null = null;
  private userPostsToday: number = 0;
  private readonly MAX_POSTS_PER_DAY = 2;

  async init(): Promise<void> {
    try {
      if (!auth) {
        console.warn('⚠️ Firebase Auth not initialized. Community features disabled.');
        return;
      }

      try {
        onAuthStateChanged(auth, (user) => {
          try {
            this.currentUser = user;
            if (user) {
              console.log('✅ User authenticated:', user.uid);
              this.checkUserPostsToday().catch(error => {
                console.error('Error checking user posts:', error);
              });
            }
          } catch (error) {
            console.error('Error in auth state change handler:', error);
          }
        });

        if (!auth.currentUser) {
          await signInAnonymously(auth);
          console.log('✅ Anonymous authentication successful');
        }
      } catch (authError) {
        console.error('❌ Error setting up authentication:', authError);
        throw authError;
      }
    } catch (error) {
      console.error('❌ Error initializing community service:', error);
    }
  }

  private async checkUserPostsToday(): Promise<void> {
    try {
      if (!this.currentUser || !db) {
        console.warn('Cannot check posts: user or database not available');
        return;
      }

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
      } catch (queryError) {
        console.error('Error querying user posts:', queryError);
        throw queryError;
      }
    } catch (error) {
      console.error('Error checking user posts:', error);
    }
  }

  canPostToday(): boolean {
    try {
      return this.userPostsToday < this.MAX_POSTS_PER_DAY;
    } catch (error) {
      console.error('Error checking post limit:', error);
      return false;
    }
  }

  getRemainingPosts(): number {
    try {
      return Math.max(0, this.MAX_POSTS_PER_DAY - this.userPostsToday);
    } catch (error) {
      console.error('Error calculating remaining posts:', error);
      return 0;
    }
  }

  async postNews(content: string, userName?: string): Promise<string> {
    try {
      if (!this.currentUser || !db) {
        throw new Error('User not authenticated or Firestore not initialized');
      }

      if (!this.canPostToday()) {
        throw new Error('Daily post limit reached (2 posts per day)');
      }

      if (!content || typeof content !== 'string') {
        throw new Error('Invalid content');
      }

      const trimmedContent = content.trim();
      if (trimmedContent.length < 10 || trimmedContent.length > 500) {
        throw new Error('Content must be between 10 and 500 characters');
      }

      try {
        const newsData = {
          userId: this.currentUser.uid,
          userName: userName || 'Anonymous',
          content: trimmedContent,
          timestamp: Date.now(),
          hearts: 0,
          heartedBy: [],
          createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'communityNews'), newsData);
        this.userPostsToday++;
        console.log('✅ News posted successfully');
        return docRef.id;
      } catch (addError) {
        console.error('❌ Error adding document:', addError);
        throw new Error('Failed to save news post');
      }
    } catch (error) {
      console.error('❌ Error posting news:', error);
      throw error;
    }
  }

  async getNews(limitCount: number = 20): Promise<CommunityNews[]> {
    try {
      if (!db) {
        console.warn('⚠️ Firestore not initialized');
        return [];
      }

      if (!limitCount || limitCount < 1) {
        console.error('Invalid limit count');
        limitCount = 20;
      }

      try {
        const newsRef = collection(db, 'communityNews');
        const q = query(newsRef, orderBy('timestamp', 'desc'), limit(limitCount));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as CommunityNews));
      } catch (queryError) {
        console.error('❌ Error querying news:', queryError);
        throw queryError;
      }
    } catch (error) {
      console.error('❌ Error fetching news:', error);
      return [];
    }
  }

  async toggleHeart(newsId: string): Promise<void> {
    try {
      if (!this.currentUser || !db) {
        throw new Error('User not authenticated or Firestore not initialized');
      }

      if (!newsId || typeof newsId !== 'string') {
        throw new Error('Invalid news ID');
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
          await updateDoc(newsRef, {
            hearts: increment(-1),
            heartedBy: newsData.heartedBy.filter(id => id !== this.currentUser!.uid)
          });
        } else {
          await updateDoc(newsRef, {
            hearts: increment(1),
            heartedBy: [...(newsData.heartedBy || []), this.currentUser.uid]
          });
        }

        console.log('✅ Heart toggled successfully');
      } catch (updateError) {
        console.error('❌ Error updating heart:', updateError);
        throw updateError;
      }
    } catch (error) {
      console.error('❌ Error toggling heart:', error);
      throw error;
    }
  }

  async submitReport(earthquakeId: string, experience: string, intensity: number, userName?: string): Promise<string> {
    try {
      if (!this.currentUser || !db) {
        throw new Error('User not authenticated or Firestore not initialized');
      }

      if (!earthquakeId || typeof earthquakeId !== 'string') {
        throw new Error('Invalid earthquake ID');
      }

      if (!experience || typeof experience !== 'string') {
        throw new Error('Invalid experience text');
      }

      const trimmedExperience = experience.trim();
      if (trimmedExperience.length < 10 || trimmedExperience.length > 1000) {
        throw new Error('Experience must be between 10 and 1000 characters');
      }

      if (typeof intensity !== 'number' || intensity < 1 || intensity > 10) {
        throw new Error('Intensity must be between 1 and 10');
      }

      try {
        const reportData = {
          earthquakeId,
          userId: this.currentUser.uid,
          userName: userName || 'Anonymous',
          experience: trimmedExperience,
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
      } catch (addError) {
        console.error('❌ Error adding report:', addError);
        throw new Error('Failed to save report');
      }
    } catch (error) {
      console.error('❌ Error submitting report:', error);
      throw error;
    }
  }

  async getReports(earthquakeId: string): Promise<EarthquakeReport[]> {
    try {
      if (!db) {
        console.warn('⚠️ Firestore not initialized');
        return [];
      }

      if (!earthquakeId || typeof earthquakeId !== 'string') {
        console.error('Invalid earthquake ID');
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
      } catch (queryError) {
        console.error('❌ Error querying reports:', queryError);
        throw queryError;
      }
    } catch (error) {
      console.error('❌ Error fetching reports:', error);
      return [];
    }
  }

  async voteOnReport(reportId: string, voteType: 'up' | 'down'): Promise<void> {
    try {
      if (!this.currentUser || !db) {
        throw new Error('User not authenticated or Firestore not initialized');
      }

      if (!reportId || typeof reportId !== 'string') {
        throw new Error('Invalid report ID');
      }

      if (voteType !== 'up' && voteType !== 'down') {
        throw new Error('Invalid vote type');
      }

      try {
        const reportRef = doc(db, 'earthquakeReports', reportId);
        const reportDoc = await getDocs(query(collection(db, 'earthquakeReports'), where('__name__', '==', reportId)));
        
        if (reportDoc.empty) {
          throw new Error('Report not found');
        }

        const reportData = reportDoc.docs[0].data() as EarthquakeReport;
        const previousVote = reportData.votedBy?.[this.currentUser.uid];

        const updates: Record<string, unknown> = {
          votedBy: {
            ...reportData.votedBy,
            [this.currentUser.uid]: voteType
          }
        };

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
      } catch (voteError) {
        console.error('❌ Error updating vote:', voteError);
        throw voteError;
      }
    } catch (error) {
      console.error('❌ Error voting on report:', error);
      throw error;
    }
  }

  async postComment(earthquakeId: string, content: string, userName?: string): Promise<string> {
    try {
      if (!this.currentUser || !db) {
        throw new Error('User not authenticated or Firestore not initialized');
      }

      if (!earthquakeId || typeof earthquakeId !== 'string') {
        throw new Error('Invalid earthquake ID');
      }

      if (!content || typeof content !== 'string') {
        throw new Error('Invalid content');
      }

      const trimmedContent = content.trim();
      if (trimmedContent.length < 1 || trimmedContent.length > 500) {
        throw new Error('Comment must be between 1 and 500 characters');
      }

      try {
        const commentData = {
          earthquakeId,
          userId: this.currentUser.uid,
          userName: userName || 'Anonymous',
          content: trimmedContent,
          timestamp: Date.now(),
          createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'earthquakeComments'), commentData);
        console.log('✅ Comment posted successfully');
        return docRef.id;
      } catch (addError) {
        console.error('❌ Error adding comment:', addError);
        throw new Error('Failed to save comment');
      }
    } catch (error) {
      console.error('❌ Error posting comment:', error);
      throw error;
    }
  }

  async getComments(earthquakeId: string): Promise<Comment[]> {
    try {
      if (!db) {
        console.warn('⚠️ Firestore not initialized');
        return [];
      }

      if (!earthquakeId || typeof earthquakeId !== 'string') {
        console.error('Invalid earthquake ID');
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
      } catch (queryError) {
        console.error('❌ Error querying comments:', queryError);
        throw queryError;
      }
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
      return [];
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      if (!this.currentUser || !db) {
        throw new Error('User not authenticated or Firestore not initialized');
      }

      if (!commentId || typeof commentId !== 'string') {
        throw new Error('Invalid comment ID');
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
      } catch (deleteError) {
        console.error('❌ Error deleting from database:', deleteError);
        throw deleteError;
      }
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      throw error;
    }
  }

  getCurrentUserId(): string | null {
    try {
      return this.currentUser?.uid || null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  }
}

export const communityService = new CommunityService();
