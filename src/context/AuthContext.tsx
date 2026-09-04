import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail, 
  sendEmailVerification,
  reload,
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
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
  name: string;
  fullName: string;
  email: string;
  organization: string;
  role: string;
  emailVerified: boolean;
  createdAt?: any;
  lastLogin?: any;
  active?: boolean;
}

export interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  login: (email: string, password: string, staySignedIn?: boolean) => Promise<User>;
  signup: (email: string, password: string, fullName: string, organization?: string, staySignedIn?: boolean) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: (staySignedIn?: boolean) => Promise<User>;
  sendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<boolean>;
  reloadUser: () => Promise<User | null>;
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
    try {
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        // Update lastLogin and emailVerified in Firestore
        await updateDoc(userDocRef, {
          lastLogin: serverTimestamp(),
          emailVerified: firebaseUser.emailVerified,
          name: firebaseUser.displayName || data.name || data.fullName || fallbackName || 'UrbanPulse Operator',
          active: true
        }).catch(() => {});

        const profile: UserProfile = {
          uid: firebaseUser.uid,
          name: data.name || data.fullName || firebaseUser.displayName || fallbackName || 'UrbanPulse Operator',
          fullName: data.fullName || data.name || firebaseUser.displayName || fallbackName || 'UrbanPulse Operator',
          email: firebaseUser.email || data.email || '',
          organization: data.organization || fallbackOrg || 'UrbanPulse',
          role: data.role || 'operator',
          emailVerified: firebaseUser.emailVerified,
          createdAt: data.createdAt,
          lastLogin: new Date(),
          active: data.active ?? true
        };
        setUserProfile(profile);
        return profile;
      } else {
        // Create user document in Firestore on first signup / Google login
        const displayName = fallbackName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'UrbanPulse Operator';
        const org = fallbackOrg || 'UrbanPulse';
        
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          name: displayName,
          fullName: displayName,
          email: firebaseUser.email || '',
          organization: org,
          role: 'operator',
          emailVerified: firebaseUser.emailVerified,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          active: true
        };

        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (err) {
      console.warn('Firestore profile sync note:', err);
      const fallbackProfile: UserProfile = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || fallbackName || 'UrbanPulse Operator',
        fullName: firebaseUser.displayName || fallbackName || 'UrbanPulse Operator',
        email: firebaseUser.email || '',
        organization: fallbackOrg || 'UrbanPulse',
        role: 'operator',
        emailVerified: firebaseUser.emailVerified,
        active: true
      };
      setUserProfile(fallbackProfile);
      return fallbackProfile;
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

  // Configure Auth Persistence (browserLocalPersistence or browserSessionPersistence)
  const applyPersistence = async (staySignedIn: boolean = true) => {
    try {
      const persistenceMode = staySignedIn ? browserLocalPersistence : browserSessionPersistence;
      await setPersistence(auth, persistenceMode);
    } catch (err) {
      console.warn('Could not set persistence mode:', err);
    }
  };

  // Email / Password Login
  const login = async (email: string, password: string, staySignedIn: boolean = true): Promise<User> => {
    setLoading(true);
    try {
      await applyPersistence(staySignedIn);
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      setUser(cred.user);
      await syncUserProfile(cred.user);
      return cred.user;
    } finally {
      setLoading(false);
    }
  };

  // Email / Password Signup with Immediate Verification Email Dispatch
  const signup = async (
    email: string, 
    password: string, 
    fullName: string, 
    organization: string = 'UrbanPulse',
    staySignedIn: boolean = true
  ): Promise<User> => {
    setLoading(true);
    try {
      await applyPersistence(staySignedIn);
      
      // 1. Create account in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        email.trim(), 
        password
      );
      const newUser = userCredential.user;

      // 2. Immediately update profile with user's Full Name
      if (fullName.trim()) {
        await updateProfile(newUser, {
          displayName: fullName.trim()
        });
      }

      // 3. Immediately send real Firebase email verification
      await sendEmailVerification(newUser);

      // 4. Create Firestore user document (without password, emailVerified: false)
      await syncUserProfile(newUser, fullName.trim(), organization.trim());

      setUser(newUser);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In
  const signInWithGoogle = async (staySignedIn: boolean = true): Promise<User> => {
    setLoading(true);
    try {
      await applyPersistence(staySignedIn);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      setUser(cred.user);
      await syncUserProfile(cred.user);
      return cred.user;
    } finally {
      setLoading(false);
    }
  };

  // Send / Resend Real Email Verification
  const sendVerificationEmail = async (): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('No user is currently signed in to receive a verification email.');
    }
    await sendEmailVerification(currentUser);
  };

  // Check / Reload Email Verification Status
  const checkEmailVerification = async (): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;
    
    // Reload user from Firebase Auth servers
    await reload(currentUser);
    const refreshedUser = auth.currentUser;
    setUser(refreshedUser);
    
    if (refreshedUser && refreshedUser.emailVerified) {
      // Update Firestore user document with emailVerified: true
      const userDocRef = doc(db, 'users', refreshedUser.uid);
      await updateDoc(userDocRef, {
        emailVerified: true,
        lastLogin: serverTimestamp()
      }).catch(() => {});
      
      setUserProfile((prev) => prev ? { ...prev, emailVerified: true } : null);
      return true;
    }
    return false;
  };

  // Reload Current User
  const reloadUser = async (): Promise<User | null> => {
    if (!auth.currentUser) return null;
    await reload(auth.currentUser);
    const refreshed = auth.currentUser;
    setUser(refreshed);
    return refreshed;
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

  const isEmailVerified = Boolean(user && user.emailVerified);

  const session = userProfile ? {
    user: {
      id: userProfile.uid,
      email: userProfile.email,
      name: userProfile.name || userProfile.fullName,
      role: (userProfile.role as UserRole) || 'operator',
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
        isEmailVerified,
        login,
        signup,
        logout,
        resetPassword,
        signInWithGoogle,
        sendVerificationEmail,
        checkEmailVerification,
        reloadUser,
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
