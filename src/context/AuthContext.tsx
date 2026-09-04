import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole } from '../types/urbanpulse';
import { DEMO_ACCOUNTS } from '../services/AuthProvider';

export interface UserProfile {
  uid: string;
  fullName: string;
  name: string;
  email: string;
  organization: string;
  role: string;
  createdAt?: any;
  lastLogin?: any;
  active?: boolean;
}

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string, organization?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  demoAccounts: typeof DEMO_ACCOUNTS;
  session?: {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      organization: string;
    };
  } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync user profile from Firestore users/{uid}
  const syncUserProfile = async (firebaseUser: User, fallbackName?: string, fallbackOrg?: string): Promise<UserProfile> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      // Update lastLogin timestamp in Firestore
      await updateDoc(userDocRef, {
        lastLogin: serverTimestamp(),
        active: true
      }).catch(() => {});

      const profile: UserProfile = {
        uid: firebaseUser.uid,
        fullName: data.fullName || data.name || firebaseUser.displayName || 'UrbanPulse Operator',
        name: data.fullName || data.name || firebaseUser.displayName || 'UrbanPulse Operator',
        email: firebaseUser.email || data.email || '',
        organization: data.organization || 'City Operations Center',
        role: data.role || 'operator',
        createdAt: data.createdAt,
        lastLogin: new Date(),
        active: data.active ?? true
      };
      setUserProfile(profile);
      return profile;
    } else {
      // First-time signup / Google sign-in document creation
      const name = fallbackName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'UrbanPulse Operator';
      const org = fallbackOrg || 'Gurugram Metropolitan Development Authority';
      
      const newProfile: UserProfile = {
        uid: firebaseUser.uid,
        fullName: name,
        name: name,
        email: firebaseUser.email || '',
        organization: org,
        role: 'operator',
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        active: true
      };

      await setDoc(userDocRef, newProfile);
      setUserProfile(newProfile);
      return newProfile;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          setUser(currentUser);
          await syncUserProfile(currentUser);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Error in onAuthStateChanged:', err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Email / Password Login
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      await syncUserProfile(cred.user);
    } finally {
      setLoading(false);
    }
  };

  // Email / Password Signup
  const signup = async (
    email: string, 
    password: string, 
    fullName: string, 
    organization: string = 'Gurugram Smart City Command'
  ): Promise<void> => {
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (fullName.trim()) {
        await updateProfile(cred.user, { displayName: fullName.trim() }).catch(() => {});
      }
      await syncUserProfile(cred.user, fullName.trim(), organization.trim());
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In
  const signInWithGoogle = async (): Promise<void> => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      await syncUserProfile(cred.user);
    } finally {
      setLoading(false);
    }
  };

  // Password Reset
  const resetPassword = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  // Logout
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const session = userProfile ? {
    user: {
      id: userProfile.uid,
      email: userProfile.email,
      name: userProfile.fullName,
      role: (userProfile.role as UserRole) || 'transport_authority',
      organization: userProfile.organization
    }
  } : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout,
        resetPassword,
        signInWithGoogle,
        demoAccounts: DEMO_ACCOUNTS,
        session
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
