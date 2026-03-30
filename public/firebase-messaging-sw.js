importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Initialize Firebase in the service worker using compat for simplicity in the SW
firebase.initializeApp({
  apiKey: "AIzaSyCj9w9EnT4mYFZUekJ7RUYsV3I5Zy976UE",
  authDomain: "app.neverbe.lk",
  projectId: "neverbe-18307",
  storageBucket: "neverbe-18307.appspot.com",
  messagingSenderId: "953976115315",
  appId: "1:953976115315:web:dda163f06336ee6972da06",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.png",
    tag: payload.notification.tag || "neverbe-notif", // deduplication
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
