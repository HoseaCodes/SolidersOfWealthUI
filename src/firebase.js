// Modified firebase.js file
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Check if environment variables are properly loaded and formatted
const apiKey = process.env.REACT_APP_FIREBASE_API_KEY?.trim();
const authDomain = process.env.REACT_APP_FIREBASE_AUTH_DOMAIN?.trim();
const projectId = process.env.REACT_APP_FIREBASE_PROJECT_ID?.trim();
const storageBucket = process.env.REACT_APP_FIREBASE_STORAGE_BUCKET?.trim();
const messagingSenderId = process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID?.trim();
const appId = process.env.REACT_APP_FIREBASE_APP_ID?.trim();
const measurementId = process.env.REACT_APP_FIREBASE_MEASUREMENT_ID?.trim();

// Make sure none of our variables have extra quotes
const removeQuotes = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/^["']|["']$/g, '');
};

const firebaseConfig = {
  apiKey: removeQuotes(apiKey),
  authDomain: removeQuotes(authDomain),
  projectId: removeQuotes(projectId),
  storageBucket: removeQuotes(storageBucket),
  messagingSenderId: removeQuotes(messagingSenderId),
  appId: removeQuotes(appId),
  measurementId: removeQuotes(measurementId)
};

// Debug: Log config (remove in production)
console.log('Firebase Config:', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 5)}...` : 'missing',
  appId: firebaseConfig.appId ? 'exists' : 'missing'
});

// Initialize Firebase only if key configuration variables exist
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'undefined') {
  console.error('Firebase API key is missing or undefined. Check your environment variables.');
  // You might want to handle this case gracefully in your application
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;