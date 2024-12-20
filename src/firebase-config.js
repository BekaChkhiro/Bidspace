// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCOp6Z8ws4e6XSk1CTyVPqdDkAoe7Slldc",
  authDomain: "bidspace-86337.firebaseapp.com",
  projectId: "bidspace-86337",
  storageBucket: "bidspace-86337.firebasestorage.app",
  messagingSenderId: "242580753474",
  appId: "1:242580753474:web:d158b2b472c5cd74b931db",
  measurementId: "G-G2TT39HFNP"
};

// Initialize Firebase with config
const app = initializeApp(firebaseConfig);

// Initialize Analytics and Auth with app instance
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Configure auth settings
auth.settings.appVerificationDisabledForTesting = false; // Ensure real verification is enabled
auth.languageCode = 'ka'; // Set language to Georgian

// Export auth instance
export { auth };