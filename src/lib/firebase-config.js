// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier } from "firebase/auth";

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

export const initializeRecaptcha = async (containerId) => {
  try {
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
    container.style.cssText = 'position: fixed; bottom: 0; right: 0; z-index: 2147483647;';
    document.body.appendChild(container);

    // Initialize new reCAPTCHA verifier
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible'
    });

    await window.recaptchaVerifier.render();
    return window.recaptchaVerifier;
  } catch (error) {
    console.error('Error initializing reCAPTCHA:', error);
    throw error;
  }
};

export { auth };