const initializeFirebaseMessaging = async () => {
    try {
        // Check if the browser supports required features
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.log('Push notifications are not supported by this browser');
            return false;
        }

        // Initialize Firebase Messaging
        const messaging = firebase.messaging();
        
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                // Get FCM token
                const token = await messaging.getToken({
                    vapidKey: 'BCkJV-jidfC3qri-Jd6BnuruEsTT1wFJuG4ZMmUx5k_fQBzERJwWMGSccipRippdhc_SOniCDpRMdKqN4NRuUqM'
                });
                console.log('FCM Token:', token);
                return true;
            }
        } catch (error) {
            console.log('Notification permission denied');
            return false;
        }
    } catch (error) {
        console.log('Error initializing Firebase Messaging:', error);
        return false;
    }
};

// Initialize messaging with error handling
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebaseMessaging().catch(error => {
        console.log('Failed to initialize Firebase Messaging:', error);
    });
});
