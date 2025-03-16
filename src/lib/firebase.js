// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
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

const initializeFirebase = () => {
  try {
    if (!app) {
      app = initializeApp(firebaseConfig);
      
      if (typeof window !== 'undefined') {
        try {
          analytics = getAnalytics(app);
        } catch (error) {
          console.warn('Analytics initialization failed:', error);
        }
      }
      
      auth = getAuth(app);
      auth.languageCode = 'ka';
    }
    return auth;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
};

export const initializeRecaptcha = async (containerId) => {
  try {
    if (!auth) {
      initializeFirebase();
    }

    // Clean up any existing reCAPTCHA instances
    if (window.recaptchaVerifier) {
      try {
        await window.recaptchaVerifier.clear();
      } catch (error) {
        console.warn('Error clearing existing reCAPTCHA:', error);
      }
      window.recaptchaVerifier = null;
    }

    // Remove any existing reCAPTCHA containers
    document.querySelectorAll('[id^="recaptcha-container-"]').forEach(el => el.remove());

    // Create new container
    const container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);

    // Initialize new reCAPTCHA verifier
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA verified successfully');
      },
      'expired-callback': () => {
        console.warn('reCAPTCHA expired');
      }
    });

    await window.recaptchaVerifier.render();
    return window.recaptchaVerifier;
  } catch (error) {
    console.error('Error initializing reCAPTCHA:', error);
    throw error;
  }
};

// Initialize Firebase on module load
initializeFirebase();

export { app, analytics, auth };