import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  where,
  deleteDoc,
  writeBatch,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import type { Review, LoggedInUser, UserRole, IPLog } from '../types';

const reviewsCollection = collection(db, 'reviews');
const usersCollection = collection(db, 'users');
const ipLogsCollection = collection(db, 'ip_logs');

const isTimestamp = (value: any): value is Timestamp => {
  return value && typeof value.toDate === 'function';
};

export const api = {
  getReviews: async (): Promise<Review[]> => {
    const q = query(reviewsCollection, orderBy('submissionDate', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const submissionDate = data.submissionDate;

      return {
        id: doc.id,
        className: data.className || '',
        ratings: data.ratings || {},
        comment: data.comment || '',
        ipAddress: data.ipAddress || 'N/A',
        submissionDate: isTimestamp(submissionDate)
          ? submissionDate.toDate().toISOString()
          : new Date().toISOString(),
      };
    });
  },

  addReview: async (reviewData: Omit<Review, 'id' | 'submissionDate'>): Promise<void> => {
    const { className, ipAddress } = reviewData;
    const q = query(reviewsCollection, where("className", "==", className), where("ipAddress", "==", ipAddress));
    const existingReviews = await getDocs(q);
    
    if (!existingReviews.empty) {
      await addDoc(ipLogsCollection, {
        ipAddress,
        className,
        timestamp: serverTimestamp(),
      });
      throw new Error("IP_LIMIT_REACHED");
    }

    await addDoc(reviewsCollection, {
      ...reviewData,
      submissionDate: serverTimestamp(),
    });
  },

  getReviewedClassesByIP: async (ip: string): Promise<string[]> => {
    if (!ip) return [];
    const q = query(reviewsCollection, where("ipAddress", "==", ip));
    const querySnapshot = await getDocs(q);
    const classes = new Set<string>();
    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data.className) {
        classes.add(data.className);
      }
    });
    return Array.from(classes);
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    const reviewDocRef = doc(db, 'reviews', reviewId);
    await deleteDoc(reviewDocRef);
  },

  deleteAllReviews: async (): Promise<void> => {
    const querySnapshot = await getDocs(reviewsCollection);
    const batch = writeBatch(db);
    querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
  },

  getIpLogs: async (): Promise<IPLog[]> => {
    const q = query(ipLogsCollection, orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      const timestamp = data.timestamp;

      return {
        id: doc.id,
        ipAddress: data.ipAddress || 'N/A',
        className: data.className || '',
        timestamp: isTimestamp(timestamp)
          ? timestamp.toDate().toISOString()
          : new Date().toISOString(),
      };
    });
  },
  
  deleteIpLog: async (logId: string): Promise<void> => {
    const logDocRef = doc(db, 'ip_logs', logId);
    await deleteDoc(logDocRef);
  },

  // User Management
  login: async (username: string, password: string):Promise<LoggedInUser | null> => {
    // Hardcoded Super Admin check
    if (username === 'vuongpham' && password === 'vuong@123') {
      return {
        id: 'superadmin',
        username: 'vuongpham',
        role: 'superadmin'
      };
    }

    const q = query(usersCollection, where("username", "==", username), where("password", "==", password));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    return {
      id: userDoc.id,
      username: userData.username,
      role: userData.role
    };
  },
  
  getUsers: async (): Promise<Omit<LoggedInUser, 'password'>[]> => {
    const q = query(usersCollection, orderBy('username'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        username: data.username,
        role: data.role,
      }
    });
  },

  addUser: async (username: string, password: string): Promise<void> => {
     // Check if username already exists
    const q = query(usersCollection, where("username", "==", username));
    const existingUsers = await getDocs(q);
    if (!existingUsers.empty) {
      throw new Error("USERNAME_EXISTS");
    }
    
    await addDoc(usersCollection, {
      username,
      password, // Note: Storing passwords in plaintext is not secure. Use Firebase Auth for real apps.
      role: 'admin' as UserRole,
    });
  },

  deleteUser: async (userId: string): Promise<void> => {
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);
  },

  updatePassword: async (userId: string, newPassword: string): Promise<void> => {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
        password: newPassword
    });
  },
};