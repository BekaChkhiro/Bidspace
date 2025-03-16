import { messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';

// Your VAPID key from Firebase Console
const VAPID_KEY = 'BCkJV-jidfC3qri-Jd6BnuruEsTT1wFJuG4ZMmUx5k_fQBzERJwWMGSccipRippdhc_SOniCDpRMdKqN4NRuUqM';

// Temporarily disabled Firebase Messaging functionality
export const initializeMessaging = async () => {
  console.log('Firebase messaging temporarily disabled');
  return false;
};

// Temporarily disabled Firebase Messaging functionality
export const setupMessageListener = () => {
  console.log('Firebase messaging temporarily disabled');
};

// Temporarily disabled Firebase Messaging functionality
export const unregisterMessaging = async () => {
  console.log('Firebase messaging temporarily disabled');
  return false;
};

const saveTokenToServer = async (token) => {
  try {
    const response = await fetch('/wp-json/custom/v1/save-fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': window.wpApiSettings?.nonce
      },
      credentials: 'include',
      body: JSON.stringify({ token })
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error saving FCM token:', error);
    return false;
  }
};