importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyCv_f10d1H0XxjYCpZeI_0NuAQibv7Cp5E",
    authDomain: "wishlist-couple.firebaseapp.com",
    projectId: "wishlist-couple",
    storageBucket: "wishlist-couple.firebasestorage.app",
    messagingSenderId: "733085795389",
    appId: "1:733085795389:web:f6dbac08b4049f386c1654"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'Thông báo mới';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/pwa-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
