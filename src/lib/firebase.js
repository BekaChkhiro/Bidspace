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
    // Remove all reCAPTCHA-related elements
    const elements = document.querySelectorAll(
      '.grecaptcha-badge, ' +
      '[id^="recaptcha"], ' +
      '[id*="grecaptcha"], ' +
      'iframe[src*="recaptcha"]'
    );
    
    elements.forEach(el => el.remove());

    if (window.recaptchaVerifier) {
      await window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }

    // Reset any global reCAPTCHA state
    if (window.grecaptcha) {
      window.grecaptcha.reset();
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
      
      // Configure auth settings
      auth.settings.appVerificationDisabledForTesting = false;
      auth.settings.persistence = true;
      
      // Log auth configuration in development
      if (process.env.NODE_ENV !== 'production') {
        console.log('Firebase Auth Configuration:', {
          currentUser: auth.currentUser,
          languageCode: auth.languageCode,
          settings: auth.settings
        });
      }
    }
    return app;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

export const initializeRecaptcha = async () => {
  try {
    if (!auth) {
      initializeFirebase();
    }

    await cleanupRecaptcha();

    // Create a dedicated container for reCAPTCHA
    const container = document.createElement('div');
    container.id = 'recaptcha-container';
    container.style.cssText = `
      position: fixed;
      bottom: -100px;
      left: 0;
      opacity: 0.01;
      pointer-events: none;
      z-index: -1;
    `;
    document.body.appendChild(container);

    // Initialize reCAPTCHA with specific parameters
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
      badge: 'inline',
      isolated: true,
      callback: (response) => {
        console.log('reCAPTCHA verified:', response?.length > 0);
      },
      'expired-callback': () => {
        cleanupRecaptcha();
      }
    });

    // Pre-render reCAPTCHA
    await window.recaptchaVerifier.render();
    
    return window.recaptchaVerifier;
  } catch (error) {
    console.error('reCAPTCHA initialization failed:', error);
    await cleanupRecaptcha();
    throw error;
  }
};

// Initialize Firebase on load
if (typeof window !== 'undefined') {
  initializeFirebase();
  
  // Cleanup on page unload
  window.addEventListener('unload', cleanupRecaptcha);
  
  // Add reCAPTCHA script if not already present
  if (!document.querySelector('script[src*="recaptcha"]')) {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
}

export { auth, app };