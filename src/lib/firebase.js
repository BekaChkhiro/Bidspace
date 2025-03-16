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
const SCRIPT_TIMEOUT = 30000; // Increased to 30 seconds
const RENDER_TIMEOUT = 10000; // 10 seconds for render timeout

const ensureScriptLoaded = () => {
  return new Promise((resolve) => {
    if (window.grecaptcha && window.grecaptcha.render) {
      resolve();
      return;
    }

    const checkGrecaptcha = () => {
      if (window.grecaptcha && window.grecaptcha.render) {
        resolve();
      } else {
        setTimeout(checkGrecaptcha, 100);
      }
    };

    checkGrecaptcha();
  });
};

const loadRecaptchaScript = () => {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded and initialized
    if (window.grecaptcha && window.grecaptcha.render) {
      resolve();
      return;
    }

    // Remove any existing reCAPTCHA scripts
    const existingScripts = document.querySelectorAll(`script[src^="${RECAPTCHA_SCRIPT_URL}"]`);
    existingScripts.forEach(script => script.remove());

    const script = document.createElement('script');
    script.src = RECAPTCHA_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    
    const timeout = setTimeout(() => {
      reject(new Error('reCAPTCHA script load timeout'));
    }, SCRIPT_TIMEOUT);

    script.onload = async () => {
      clearTimeout(timeout);
      try {
        await ensureScriptLoaded();
        // Additional delay after script is fully loaded
        setTimeout(resolve, 1500);
      } catch (error) {
        reject(error);
      }
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

    // Remove grecaptcha-related elements
    const grecaptchaElements = document.querySelectorAll('.grecaptcha-badge, #grecaptcha-container, .grecaptcha-iframe');
    grecaptchaElements.forEach(element => element.parentNode?.removeChild(element));

    // Reset grecaptcha if it exists
    if (window.grecaptcha) {
      try {
        window.grecaptcha.reset();
      } catch (error) {
        console.warn('Error resetting grecaptcha:', error);
      }
    }

  } catch (error) {
    console.warn('Error cleaning up reCAPTCHA:', error);
  }
};

export const initializeRecaptcha = async (buttonId) => {
  try {
    if (!auth) {
      initializeFirebase();
    }

    // Clean up existing reCAPTCHA instances
    await cleanupRecaptcha();

    // Ensure reCAPTCHA script is loaded with retries
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        await loadRecaptchaScript();
        break;
      } catch (error) {
        retryCount++;
        if (retryCount === maxRetries) {
          throw error;
        }
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Create a unique container for this instance
    const containerId = `recaptcha-container-${Date.now()}`;
    const container = document.createElement('div');
    container.id = containerId;
    container.style.cssText = 'position: fixed; bottom: 0; right: 0; z-index: 2147483647; opacity: 0.1;';
    document.body.appendChild(container);

    // Create new reCAPTCHA verifier with render timeout
    const renderPromise = new Promise(async (resolve, reject) => {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
          callback: (response) => {
            console.log('reCAPTCHA verified successfully');
            container.style.opacity = '0.1';
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

        // Make container visible during verification
        container.style.opacity = '1';
        
        await window.recaptchaVerifier.render();
        resolve(window.recaptchaVerifier);
      } catch (error) {
        reject(error);
      }
    });

    // Add render timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('reCAPTCHA render timeout')), RENDER_TIMEOUT);
    });

    return await Promise.race([renderPromise, timeoutPromise]);
  } catch (error) {
    console.error('Error initializing reCAPTCHA:', error);
    await cleanupRecaptcha();
    throw error;
  }
};

// Initialize Firebase on module load
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

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('unload', cleanupRecaptcha);
}

// Initialize Firebase on module load
initializeFirebase();

export { app, analytics, auth, messaging };