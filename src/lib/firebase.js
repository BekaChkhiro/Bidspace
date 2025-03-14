// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBuGY5gOZwv5ffjXLLZLjVt9QM2Ry_fFw",
  authDomain: "bidspace-7ef9d.firebaseapp.com",
  projectId: "bidspace-7ef9d",
  storageBucket: "bidspace-7ef9d.firebasestorage.app",
  messagingSenderId: "996429142012",
  appId: "1:996429142012:web:de1d02c1d6cb51f1154479",
  measurementId: "G-5DPQ72NG0W"
};

let app;
let analytics;
let auth;
let messaging;

const cleanupRecaptcha = async () => {
  try {
    // Clean up any existing reCAPTCHA widgets
    const existingWidgets = document.querySelectorAll('[id^="recaptcha-container-"]');
    existingWidgets.forEach(widget => {
      if (widget && widget.parentNode) {
        widget.parentNode.removeChild(widget);
      }
    });

    if (window.recaptchaVerifier) {
      await window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  } catch (error) {
    console.warn('Error cleaning up reCAPTCHA:', error);
  }
};

const initializeFirebase = () => {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      
      if (typeof window !== 'undefined') {
        analytics = getAnalytics(app);
      }
      
      auth = getAuth(app);
      auth.languageCode = 'ka';
      auth.settings.appVerificationDisabledForTesting = false;
      
      // Enable debug mode for development
      if (process.env.NODE_ENV !== 'production') {
        auth._config.emulator = false; // Ensure we're using production Firebase
        console.log('Firebase Auth initialized with config:', auth._config);
      }
      
      // Configure auth persistence
      auth.settings.persistence = true;
      
      // Enable debug mode for development
      if (process.env.NODE_ENV !== 'production') {
        auth.settings.debug = true;
      }
      
      if (typeof window !== 'undefined') {
        try {
          messaging = getMessaging(app);
        } catch (error) {
          console.warn('Firebase messaging initialization failed:', error);
        }
      }
    }
    return auth;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

export const initializeRecaptcha = async (buttonId) => {
  try {
    if (!auth) {
      initializeFirebase();
    }

    await cleanupRecaptcha();

    console.log('Setting up reCAPTCHA with container:', buttonId);
    const container = document.getElementById(buttonId);
    if (!container) {
      console.error('Container element not found:', buttonId);
      throw new Error('Container element not found');
    }

    // Create new reCAPTCHA verifier with improved settings
    window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
      size: 'normal', // Changed to normal for debugging
      callback: (response) => {
        console.log('reCAPTCHA verified successfully:', response);
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired, cleaning up...');
        cleanupRecaptcha();
      },
      'error-callback': (error) => {
        console.error('reCAPTCHA error:', error);
        cleanupRecaptcha();
      },
      isolated: true, // Use isolated mode
      hl: 'ka' // Set language to Georgian
    });

    console.log('Rendering reCAPTCHA...');
    await window.recaptchaVerifier.render();
    console.log('reCAPTCHA rendered successfully');

    return window.recaptchaVerifier;
  } catch (error) {
    console.error('Error initializing reCAPTCHA:', error);
    await cleanupRecaptcha();
    throw error;
  }
};

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('unload', cleanupRecaptcha);
}

// Initialize Firebase on module load
initializeFirebase();

export { app, analytics, auth, messaging };