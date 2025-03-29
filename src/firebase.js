import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCwlU9nKgAuWMK2yqn4uUIWoBjvxKRsM7Y",
  authDomain: "taskerer-f72e3.firebaseapp.com",
  projectId: "taskerer-f72e3",
  storageBucket: "taskerer-f72e3.firebasestorage.app",
  messagingSenderId: "156317212431",
  appId: "1:156317212431:web:e1507f28984563944d287a",
  measurementId: "G-4D7WGPQVE1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app); // database

// initializing the authentication service
const auth = getAuth();

export { db, auth };