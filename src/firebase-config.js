// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

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
auth.languageCode = 'ka'; // Set language to Georgian

// Initialize global reCAPTCHA verifier
const initializeRecaptcha = (containerId) => {
  // Clean up existing instance if any
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (error) {
      console.error('Error clearing existing reCAPTCHA:', error);
    }
    window.recaptchaVerifier = null;
  }

  // Create new instance
  try {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA verified successfully');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
        if (window.recaptchaVerifier) {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
        }
      }
    });
    
    return window.recaptchaVerifier;
  } catch (error) {
    console.error('Error initializing reCAPTCHA:', error);
    throw error;
  }
};

// Clean up function for reCAPTCHA
const cleanupRecaptcha = () => {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (error) {
      console.error('Error clearing reCAPTCHA:', error);
    }
    window.recaptchaVerifier = null;
  }
  if (window.confirmationResult) {
    window.confirmationResult = null;
  }
};

// Export auth instance and reCAPTCHA functions
export { auth, initializeRecaptcha, cleanupRecaptcha };