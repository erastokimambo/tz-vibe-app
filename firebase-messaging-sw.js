importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyC5P-28Ja556UwZQauck_Rzxsl9aHgf-6Y",
  authDomain: "tzvibe-9f2e4.firebaseapp.com",
  projectId: "tzvibe-9f2e4",
  storageBucket: "tzvibe-9f2e4.firebasestorage.app",
  messagingSenderId: "287400359995",
  appId: "1:287400359995:web:641dfe4aede41116f9841e",
  measurementId: "G-CG7SRTC5XX"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png' // Replace with app icon if available
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});
