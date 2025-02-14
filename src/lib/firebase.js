import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCOp6Z8ws4e6XSk1CTyVPqdDkAoe7Slldc",
  authDomain: "bidspace-86337.firebaseapp.com",
  projectId: "bidspace-86337",
  storageBucket: "bidspace-86337.firebasestorage.app",
  messagingSenderId: "242580753474",
  appId: "1:242580753474:web:d158b2b472c5cd74b931db",
  measurementId: "G-G2TT39HFNP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize reCAPTCHA verifier
const initializeRecaptcha = (buttonId) => {
  return new Promise((resolve) => {
    try {
      // Clear existing recaptcha if it exists
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }

      // Remove any existing recaptcha elements
      const existingRecaptcha = document.querySelector('.grecaptcha-badge');
      if (existingRecaptcha) {
        existingRecaptcha.remove();
      }
      
      // Create new recaptcha verifier
      window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA verified');
          resolve(window.recaptchaVerifier);
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }
          resolve(null);
        }
      });

      // Render the recaptcha
      window.recaptchaVerifier.render().then(() => {
        resolve(window.recaptchaVerifier);
      }).catch((error) => {
        console.error('Error rendering reCAPTCHA:', error);
        resolve(null);
      });
    } catch (error) {
      console.error('Error initializing reCAPTCHA:', error);
      resolve(null);
    }
  });
};

// Disable app verification in development
if (process.env.NODE_ENV === 'development') {
  auth.settings.appVerificationDisabledForTesting = true;
}

export { auth, initializeRecaptcha };