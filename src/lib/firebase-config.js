// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithCredential } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBuGY5gOZwv5ffjXLLZLjVt9QM2Ry_fFw",
  authDomain: "bidspace-7ef9d.firebaseapp.com",
  projectId: "bidspace-7ef9d",
  storageBucket: "bidspace-7ef9d.firebasestorage.app",
  messagingSenderId: "996429142012",
  appId: "1:996429142012:web:de1d02c1d6cb51f1154479"
};

// Initialize Firebase only once
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure auth settings
auth.languageCode = 'ka';

// Keep track of the current reCAPTCHA instance
let currentRecaptchaVerifier = null;
let recaptchaContainer = null;

const clearExistingRecaptcha = async () => {
  if (currentRecaptchaVerifier) {
    try {
      await currentRecaptchaVerifier.clear();
      currentRecaptchaVerifier = null;
    } catch (error) {
      console.warn('Error clearing existing reCAPTCHA:', error);
    }
  }

  // Remove any existing containers and iframes
  if (recaptchaContainer) {
    recaptchaContainer.remove();
    recaptchaContainer = null;
  }
  document.querySelectorAll('iframe[src*="recaptcha"]').forEach(el => el.remove());
};

export const initializeRecaptcha = async (containerId, retryCount = 0) => {
  try {
    await clearExistingRecaptcha();

    // Create new container
    recaptchaContainer = document.createElement('div');
    recaptchaContainer.id = containerId;
    recaptchaContainer.style.cssText = 'position: fixed; bottom: 0; right: 0; z-index: 2147483647; opacity: 0.01;';
    document.body.appendChild(recaptchaContainer);

    // Initialize new reCAPTCHA verifier with error handling
    currentRecaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {},
      'expired-callback': async () => {
        console.log('reCAPTCHA expired, reinitializing...');
        await clearExistingRecaptcha();
      },
      'error-callback': async () => {
        console.log('reCAPTCHA error, reinitializing...');
        await clearExistingRecaptcha();
      }
    });

    await currentRecaptchaVerifier.render();
    return currentRecaptchaVerifier;
  } catch (error) {
    console.error('Error initializing reCAPTCHA:', error);
    
    // Retry logic for network errors
    if (retryCount < 2 && (error.code === 'auth/network-request-failed' || error.message?.includes('network'))) {
      console.log(`Retrying reCAPTCHA initialization (attempt ${retryCount + 1})...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return initializeRecaptcha(containerId, retryCount + 1);
    }
    
    throw error;
  }
};

// Cleanup function to be called when component unmounts
export const cleanupRecaptcha = async () => {
  await clearExistingRecaptcha();
};

export { auth, signInWithCredential };