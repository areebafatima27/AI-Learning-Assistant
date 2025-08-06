import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDJUlFA7fqd8S3AAtCZsAzPXbJYfzavuP8",
  authDomain: "ai-assistant-926e2.firebaseapp.com",
  projectId: "ai-assistant-926e2",
  storageBucket: "ai-assistant-926e2.appspot.com", // fixed typo
  messagingSenderId: "680174229465",
  appId: "1:680174229465:web:8d33d6aa8e47404b596bc8",
  measurementId: "G-QD69FS6FRQ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();