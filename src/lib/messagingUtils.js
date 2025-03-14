import { messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';

// Your VAPID key from Firebase Console
const VAPID_KEY = 'BCkJV-jidfC3qri-Jd6BnuruEsTT1wFJuG4ZMmUx5k_fQBzERJwWMGSccipRippdhc_SOniCDpRMdKqN4NRuUqM';

export const initializeMessaging = async () => {
  // Return early if messaging wasn't initialized
  if (!messaging) {
    console.log('Firebase messaging not available');
    return false;
  }

  try {
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return false;
    }

    if (!('serviceWorker' in navigator)) {
      console.error('Service Worker not supported');
      return false;
    }

    // First check if we have an active service worker
    const registration = await navigator.serviceWorker.ready;
    if (!registration) {
      console.error('No active service worker found');
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    // Get FCM token
    const token = await getToken(messaging, { 
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });
    
    if (token) {
      console.log('FCM Token obtained successfully');
      await saveTokenToServer(token);
      return true;
    }

    console.error('Failed to get FCM token');
    return false;
  } catch (error) {
    console.error('Error initializing messaging:', error);
    return false;
  }
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

export const setupMessageListener = () => {
  if (!messaging) {
    console.log('Firebase messaging not available');
    return;
  }

  onMessage(messaging, (payload) => {
    console.log('Received foreground message:', payload);
    
    const { notification } = payload;
    if (!notification) return;

    // Display notification using the Notification API
    const notificationOptions = {
      body: notification.body,
      icon: notification.icon || '/wp-content/themes/Bidspace-Main-Theme/src/assets/images/notification-icon.png',
      badge: notification.badge || '/wp-content/themes/Bidspace-Main-Theme/src/assets/images/badge-icon.png',
      data: payload.data || {}
    };

    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(notification.title, notificationOptions);
    });
  });
};

export const unregisterMessaging = async () => {
  if (!messaging) {
    console.log('Firebase messaging not available');
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.pushManager.getSubscription();
    // Unregister from server
    await fetch('/wp-json/custom/v1/remove-fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': window.wpApiSettings?.nonce
      },
      credentials: 'include'
    });
    return true;
  } catch (error) {
    console.error('Error unregistering messaging:', error);
    return false;
  }
};