import { create } from 'zustand';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';

export const useStatsStore = create((set, get) => ({
  stats: {
    documentsProcessed: 0,
    questionsAsked: 0,
    flashcardsCreated: 0,
    quizzesCompleted: 0,
  },
  isLoading: true,
  isOnline: true,
  
  // Initialize and load stats from Firestore
  initializeStats: async () => {
    try {
      const auth = getAuth();
      
      // Wait for auth state to be ready
      if (!auth.currentUser) {
        // If no user, wait for auth state change
        return new Promise((resolve) => {
          const unsubscribe = auth.onAuthStateChanged(async (user) => {
            unsubscribe(); // Unsubscribe after first change
            if (user) {
              await get().loadUserStats(user.uid);
            }
            resolve();
          });
        });
      }

      // User is already authenticated, load stats directly
      await get().loadUserStats(auth.currentUser.uid);
    } catch (error) {
      console.error("Error initializing stats:", error);
      set({ isLoading: false });
    }
  },

  // Load user stats from Firestore
  loadUserStats: async (userId) => {
    try {
      console.log("Loading stats for user:", userId);
      const userRef = doc(db, 'users', userId);
      
      // Check if we're online
      try {
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("User stats found:", data);
          set({
            stats: {
              documentsProcessed: data.documentsProcessed || 0,
              questionsAsked: data.questionsAsked || 0,
              flashcardsCreated: data.flashcardsCreated || 0,
              quizzesCompleted: data.quizzesCompleted || 0,
            },
            isLoading: false
          });
        } else {
          console.log("No user stats found, initializing new user document");
          // Initialize new user document if it doesn't exist
          await setDoc(userRef, {
            documentsProcessed: 0,
            questionsAsked: 0,
            flashcardsCreated: 0,
            quizzesCompleted: 0,
            createdAt: serverTimestamp(),
            lastUpdated: serverTimestamp()
          });
          set({ isLoading: false });
        }
      } catch (firestoreError) {
        if (firestoreError.code === 'unavailable' || firestoreError.message.includes('offline')) {
          console.log("Firestore offline, using cached data or defaults");
          // Use cached data or defaults when offline
          set({ isLoading: false });
        } else {
          throw firestoreError;
        }
      }
    } catch (error) {
      console.error("Error loading user stats:", error);
      set({ isLoading: false });
    }
  },

  // Increment a specific stat
  incrementStat: async (statName) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.error("No user authenticated when trying to increment stat:", statName);
      return;
    }

    try {
      console.log(`Incrementing ${statName} for user:`, user.uid);
      
      // Optimistic UI update
      set(state => ({
        stats: {
          ...state.stats,
          [statName]: state.stats[statName] + 1
        }
      }));

      // Update Firestore
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        [statName]: increment(1),
        lastUpdated: serverTimestamp()
      });
      
      console.log(`Successfully incremented ${statName} in Firestore`);
    } catch (error) {
      console.error("Error incrementing stat:", error);
      // Rollback on error
      set(state => ({
        stats: {
          ...state.stats,
          [statName]: state.stats[statName] - 1
        }
      }));
    }
  },

  // Refresh stats from Firestore
  refreshStats: async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      console.error("No user authenticated when trying to refresh stats");
      return;
    }

    try {
      console.log("Refreshing stats for user:", user.uid);
      await get().loadUserStats(user.uid);
    } catch (error) {
      console.error("Error refreshing stats:", error);
    }
  },

  // Check network status
  checkNetworkStatus: async () => {
    try {
      // Try to make a simple Firestore operation to check connectivity
      const testRef = doc(db, '_test', 'connection');
      await getDoc(testRef);
      set({ isOnline: true });
      console.log('Network connection restored');
    } catch (error) {
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        set({ isOnline: false });
        console.log('Network connection lost');
      }
    }
  }
}));