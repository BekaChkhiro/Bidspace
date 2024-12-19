// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCOp6Z8ws4e6XSk1CTyVPqdDkAoe7Slldc",
  authDomain: "bidspace-86337.firebaseapp.com",
  projectId: "bidspace-86337",
  storageBucket: "bidspace-86337.firebasestorage.app",
  messagingSenderId: "242580753474",
  appId: "1:242580753474:web:d158b2b472c5cd74b931db",
  measurementId: "G-G2TT39HFNP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics and Auth
const analytics = getAnalytics(app);
const auth = getAuth(app);

// Export auth instance
export { auth };