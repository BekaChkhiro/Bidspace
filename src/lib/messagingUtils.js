import { messaging } from './firebase';
import { getToken, onMessage } from 'firebase/messaging';

// Your VAPID key from Firebase Console
const VAPID_KEY = 'BCkcASvppvwL4uJTEvzXOwrfEn9l1LXzH_skR1jRnK2BC8FC2157ldVkn3DfMktJpRIH7eeo0IeSxBYjDaABlMQ';

export const initializeMessaging = async () => {
  try {
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return false;
    }

    // Get FCM token
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (token) {
      console.log('FCM Token:', token);
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