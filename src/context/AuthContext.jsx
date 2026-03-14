import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, messaging } from "../services/config";
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const requestNotificationPermission = async (uid) => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging);
        if (token) {
          const userRef = doc(db, 'users', uid);
          await updateDoc(userRef, { fcmToken: token });
        }
      }
    } catch (error) {
      console.log("FCM Token fetch failed:", error);
    }
  };

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        try {
          // Ensure a user document exists in Firestore
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            // Create initial profile for new anonymous users
            const initialProfile = {
              uid: firebaseUser.uid,
              displayName: firebaseUser.isAnonymous ? 'Anonymous Guest' : (firebaseUser.displayName || 'User'),
              createdAt: new Date().toISOString(),
              savedListings: [], // array of business IDs
              isAdmin: false // for future admin panel rules
            };
            await setDoc(userRef, initialProfile);
            setUserProfile(initialProfile);
          } else {
            setUserProfile(userSnap.data());
          }
          
          if (!firebaseUser.isAnonymous) {
            requestNotificationPermission(firebaseUser.uid);
          }
        } catch (error) {
          console.warn("Firestore offline. Using fallback auth profile.", error);
          setUserProfile({
            uid: firebaseUser.uid,
            displayName: firebaseUser.isAnonymous ? 'Anonymous Guest' : (firebaseUser.displayName || 'User'),
            isAdmin: false
          });
        }
      } else {
        // Explicitly clear local state on logout
        setUser(null);
        setUserProfile(null);
        
        // Automatically sign in anonymously if no user is found
        try {
          await signInAnonymously(auth);
        } catch (error) {
          console.error("Auth Failed (Anonymous Auth might be disabled in Firebase Console):", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Expose an immediate, definitive boolean for Guest status
  // This prevents UI flicker while waiting for the Firestore userProfile to sync
  const isGuest = !user || user.isAnonymous === true;

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isGuest }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
