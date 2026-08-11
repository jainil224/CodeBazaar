import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  signInWithPopup
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  purchasedIds?: string[];
  photoURL?: string;
  createdAt?: any;
  updatedAt?: any;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string, name: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        // Set up real-time listener on the Firestore user profile
        const userRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeProfile = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setUserProfile({
              uid: data.uid,
              name: data.name,
              email: data.email,
              role: data.role,
              purchasedIds: data.purchasedIds || [],
              photoURL: data.photoURL || firebaseUser.photoURL || '',
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            });
          } else {
            // Fallback user profile in case Firestore write is delayed
            setUserProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'User',
              role: 'user',
              purchasedIds: [],
              photoURL: firebaseUser.photoURL || ''
            });
          }
          setLoading(false);
        }, (err) => {
          console.error("Firestore user profile load error:", err);
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string, name: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const role = email.toLowerCase() === 'admin@codebazaar.com' ? 'admin' : 'user';
    
    // Create matching user profile document
    await setDoc(doc(db, 'users', res.user.uid), {
      uid: res.user.uid,
      email: res.user.email,
      name,
      role,
      purchasedIds: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return res;
  };

  const loginWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    const u = res.user;
    const userRef = doc(db, 'users', u.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      const role = u.email?.toLowerCase() === 'admin@codebazaar.com' ? 'admin' : 'user';
      await setDoc(userRef, {
        uid: u.uid,
        email: u.email || '',
        name: u.displayName || 'Google User',
        role,
        photoURL: u.photoURL || '',
        purchasedIds: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    return res;
  };

  const logout = () => {
    return signOut(auth);
  };

  const resetPassword = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      isAuthenticated: !!user,
      login,
      signup,
      loginWithGoogle,
      logout,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
