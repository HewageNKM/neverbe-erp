importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "TODO_REPLACE_WITH_VITE_FIREBASE_API_KEY",
  authDomain: "neverbe-lk.firebaseapp.com",
  projectId: "neverbe-lk",
  storageBucket: "neverbe-lk.appspot.com",
  messagingSenderId: "565019318856",
  appId: "1:565019318856:web:6e688e5718e5...",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.png",
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
