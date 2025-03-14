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

// Initialize reCAPTCHA function with improved cleanup
export const initializeRecaptcha = async (buttonId) => {
  try {
    if (!auth) {
      initializeFirebase();
    }

    // Remove any existing reCAPTCHA widgets first
    const existingWidgets = document.querySelectorAll('.grecaptcha-badge');
    existingWidgets.forEach(widget => widget.parentElement.remove());
    
    // Reset the internal reCAPTCHA state
    if (window.recaptchaVerifier) {
      try {
        await window.recaptchaVerifier.clear();
      } catch (error) {
        console.warn('Error clearing existing reCAPTCHA:', error);
      }
      window.recaptchaVerifier = null;
    }

    // Get the button element
    const buttonElement = document.getElementById(buttonId);
    if (!buttonElement) {
      throw new Error(`Button element with id ${buttonId} not found`);
    }

    // Create new reCAPTCHA verifier with unique container
    const containerId = `recaptcha-container-${Date.now()}`;
    const container = document.createElement('div');
    container.id = containerId;
    buttonElement.parentNode.insertBefore(container, buttonElement.nextSibling);

    window.recaptchaVerifier = new RecaptchaVerifier(auth, container, {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA verified successfully');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
        initializeRecaptcha(buttonId).catch(console.error);
      },
      'error-callback': (error) => {
        console.error('reCAPTCHA error:', error);
      }
    });

    return window.recaptchaVerifier;
  } catch (error) {
    console.error('Error initializing reCAPTCHA:', error);
    throw error;
  }
};

// Initialize Firebase on module load
initializeFirebase();

export { app, analytics, auth, messaging };