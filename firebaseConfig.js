import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDJUlFA7fqd8S3AAtCZsAzPXbJYfzavuP8",
  authDomain: "ai-assistant-926e2.firebaseapp.com",
  projectId: "ai-assistant-926e2",
  storageBucket: "ai-assistant-926e2.appspot.com",
  messagingSenderId: "680174229465",
  appId: "1:680174229465:web:8d33d6aa8e47404b596bc8",
  measurementId: "G-QD69FS6FRQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
const db = getFirestore(app);

// Simple connection test
const testFirestoreConnection = async () => {
  try {
    console.log('Firestore initialized successfully');
    console.log('Database instance:', db);
  } catch (error) {
    console.error('Error initializing Firestore:', error);
  }
};

// Test connection
testFirestoreConnection();

// Export Firebase services
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export { db };

// Add Google Sign-in function
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    throw error;
  }
};
