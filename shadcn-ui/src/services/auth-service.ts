import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail, 
  updateProfile, 
  User,
  UserCredential
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

// User registration
export const registerUser = async (
  email: string,
  password: string,
  displayName: string
): Promise<User> => {
  try {
    // Create the user
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Update profile with display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, {
        displayName
      });

      // Store additional user info in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email,
        displayName,
        role: 'user', // Default role
        createdAt: Timestamp.now(),
        farms: [] // Empty array of associated farms
      });
    }

    return userCredential.user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// User login
export const signIn = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

// User logout
export const signOut = async (): Promise<void> => {
  return firebaseSignOut(auth);
};

// Password reset
export const resetPassword = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email);
};

// Get current user data from Firestore
export const getCurrentUserData = async () => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('No user is currently logged in');
  }
  
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (userDoc.exists()) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      ...userDoc.data()
    };
  }
  
  return null;
};