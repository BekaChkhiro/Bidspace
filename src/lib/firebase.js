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

const RECAPTCHA_SCRIPT_URL = 'https://www.google.com/recaptcha/api.js';
const SCRIPT_TIMEOUT = 10000; // 10 seconds timeout

const loadRecaptchaScript = () => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (document.querySelector(`script[src^="${RECAPTCHA_SCRIPT_URL}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = RECAPTCHA_SCRIPT_URL;
    script.async = true;
    script.defer = true; // Add defer attribute
    
    const timeout = setTimeout(() => {
      reject(new Error('reCAPTCHA script load timeout'));
    }, SCRIPT_TIMEOUT);

    script.onload = () => {
      clearTimeout(timeout);
      // Give a small delay after script load to ensure proper initialization
      setTimeout(resolve, 1000);
    };

    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to load reCAPTCHA script'));
    };

    document.head.appendChild(script);
  });
};

const cleanupRecaptcha = async () => {
  try {
    // Clean up any existing reCAPTCHA widgets
    const existingWidgets = document.querySelectorAll('[id^="recaptcha-container-"]');
    existingWidgets.forEach(widget => {
      if (widget && widget.parentNode) {
        widget.parentNode.removeChild(widget);
      }
    });

    // Clear any existing verifier
    if (window.recaptchaVerifier) {
      try {
        await window.recaptchaVerifier.clear();
      } catch (error) {
        console.warn('Error clearing existing reCAPTCHA:', error);
      }
      window.recaptchaVerifier = null;
    }

    // Remove any leftover reCAPTCHA iframes and grecaptcha elements
    const iframes = document.querySelectorAll('iframe[src*="recaptcha"]');
    iframes.forEach(iframe => iframe.parentNode?.removeChild(iframe));
    
    // Remove grecaptcha-related elements
    const grecaptchaElements = document.querySelectorAll('.grecaptcha-badge, #grecaptcha-container');
    grecaptchaElements.forEach(element => element.parentNode?.removeChild(element));

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

      // Enable test mode for development
      const isLocalhost = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1' ||
                         window.location.hostname.includes('.local');
                         
      if (isLocalhost) {
        auth.settings.appVerificationDisabledForTesting = true;
        console.log('Firebase Auth Test Mode enabled for development');
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

    // Clean up existing reCAPTCHA instances
    await cleanupRecaptcha();

    // Ensure reCAPTCHA script is loaded
    await loadRecaptchaScript();

    // Create a unique container for this instance
    const containerId = `recaptcha-container-${Date.now()}`;
    const container = document.createElement('div');
    container.id = containerId;
    container.style.cssText = 'position: fixed; bottom: 0; right: 0; z-index: 2147483647;';
    document.body.appendChild(container);

    // Create new reCAPTCHA verifier with retry logic
    const createVerifier = async (retryCount = 0) => {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
          callback: (response) => {
            console.log('reCAPTCHA verified successfully');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            cleanupRecaptcha();
          },
          'error-callback': (error) => {
            console.error('reCAPTCHA error:', error);
            cleanupRecaptcha();
          }
        });

        await window.recaptchaVerifier.render();
        return window.recaptchaVerifier;
      } catch (error) {
        if (retryCount < 2) {
          console.log(`Retrying reCAPTCHA initialization (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return createVerifier(retryCount + 1);
        }
        throw error;
      }
    };

    return await createVerifier();
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