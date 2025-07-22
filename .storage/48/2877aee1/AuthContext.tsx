import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import * as authService from '@/services/auth-service';
import { toast } from 'sonner';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: string;
  farms: string[];
  [key: string]: any;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const data = await authService.getCurrentUserData();
          setUserData(data as UserData);
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Continue with just the basic user info
          setUserData({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: 'user',
            farms: []
          });
        }
      } else {
        setUserData(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      await authService.signIn(email, password);
      toast.success('Signed in successfully');
    } catch (error: any) {
      console.error('Error signing in:', error);
      const errorMessage = error.code === 'auth/invalid-credential' 
        ? 'Invalid email or password' 
        : 'Error signing in';
      toast.error(errorMessage);
      throw error;
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      await authService.registerUser(email, password, displayName);
      toast.success('Account created successfully');
    } catch (error: any) {
      console.error('Error signing up:', error);
      let errorMessage = 'Error creating account';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }
      
      toast.error(errorMessage);
      throw error;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await authService.signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      await authService.resetPassword(email);
      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Error sending password reset email');
      throw error;
    }
  };

  const value = {
    currentUser,
    userData,
    isAuthenticated: !!currentUser,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};