import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDc7Bsk4Ox0UzkkuzjeJDkZ8vWQmAJs9C8",
  authDomain: "ganaderia-9e67c.firebaseapp.com",
  projectId: "ganaderia-9e67c",
  storageBucket: "ganaderia-9e67c.firebasestorage.app",
  messagingSenderId: "828179477615",
  appId: "1:828179477615:web:0b87e4515104c11642899a",
  measurementId: "G-T3Q27D6KL9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);
const storage = getStorage(app);

export { app, db, auth, functions, storage };