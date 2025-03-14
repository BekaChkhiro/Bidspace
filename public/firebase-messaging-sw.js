// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyDBuGY5gOZwv5ffjXLLZLjVt9QM2Ry_fFw",
  authDomain: "bidspace-7ef9d.firebaseapp.com",
  projectId: "bidspace-7ef9d",
  storageBucket: "bidspace-7ef9d.firebasestorage.app",
  messagingSenderId: "996429142012",
  appId: "1:996429142012:web:de1d02c1d6cb51f1154479"
});

// Retrieve firebase messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notification = payload.notification;
  if (!notification) return;

  // Customize notification here
  const notificationOptions = {
    body: notification.body,
    icon: notification.icon || '/wp-content/themes/Bidspace-Main-Theme/src/assets/images/notification-icon.png',
    badge: notification.badge || '/wp-content/themes/Bidspace-Main-Theme/src/assets/images/badge-icon.png',
    data: payload.data || {},
    tag: 'bidspace-notification',
    requireInteraction: true
  };

  return self.registration.showNotification(
    notification.title,
    notificationOptions
  );
});