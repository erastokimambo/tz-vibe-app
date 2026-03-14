import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5P-28Ja556UwZQauck_Rzxsl9aHgf-6Y",
  authDomain: "tzvibe-9f2e4.firebaseapp.com",
  projectId: "tzvibe-9f2e4",
  storageBucket: "tzvibe-9f2e4.firebasestorage.app",
  messagingSenderId: "287400359995",
  appId: "1:287400359995:web:641dfe4aede41116f9841e",
  measurementId: "G-CG7SRTC5XX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Sign in anonymously on init
signInAnonymously(auth).catch((error) => {
  console.error("Anonymous sign-in failed:", error);
});

export { auth, db };
