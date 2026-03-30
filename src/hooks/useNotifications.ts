import { useEffect, useState } from "react";
import { messaging, fcmGetToken, onMessage, db, auth } from "@/firebase/firebaseClient";
import { doc, updateDoc, arrayUnion, onSnapshot, collection, query, orderBy, limit } from "firebase/firestore";
import toast from "react-hot-toast";

export interface Notification {
  id: string;
  type: "ORDER" | "STOCK" | "SYSTEM" | "AI";
  title: string;
  message: string;
  metadata?: any;
  read: boolean;
  createdAt: any;
}

export const useNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 1. Request Permission and Get Token
  const requestPermission = async () => {
    let vapidKey: string | undefined;
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.warn("[useNotifications] Missing VITE_FIREBASE_VAPID_KEY. Push notifications will not work.");
          return;
        }

        // 0. Debug log to verify key (first 10 chars)
        console.log("[useNotifications] Attempting registration with VAPID:", vapidKey.substring(0, 10) + "...");

        // 1. Clean up any existing broken registrations for this scope
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (let reg of registrations) {
            if (reg.active?.scriptURL.includes('firebase-messaging-sw.js')) {
              console.log("[useNotifications] Cleaning up old worker:", reg.active.scriptURL);
              await reg.unregister();
            }
          }

          // 2. Fresh registration
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
          await navigator.serviceWorker.ready;
          
          console.log("[useNotifications] Fresh SW Active. Scope:", registration.scope);
          
          // 3. Small delay to let the Push Manager settle (resolves AbortErrors on localhost)
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const token = await fcmGetToken(messaging, {
            vapidKey: vapidKey.trim(),
            serviceWorkerRegistration: registration,
          });
          
          if (token) {
            setFcmToken(token);
            saveTokenToUser(token);
            toast.success("Push notifications enabled!");
          }
        }
      }
    } catch (error: any) {
      console.error("[useNotifications] Token Error Details:", {
        message: error.message,
        name: error.name,
        code: error.code,
        vapidPrefix: vapidKey?.substring(0, 5)
      });
      if (error.name === 'AbortError') {
        toast.error("Notification registration failed. Please refresh and try again.");
      }
    }
  };

  // 2. Save Token to User Profile
  const saveTokenToUser = async (token: string) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          fcmTokens: arrayUnion(token),
          notificationsEnabled: true,
          updatedAt: new Date()
        });
        console.log("[useNotifications] FCM Token saved to user profile.");
      } catch (error) {
        console.warn("[useNotifications] Failed to save token (user doc might not exist yet):", error);
      }
    }
  };

  // 3. Listen for Background/Foreground Messages
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("[useNotifications] Foreground message received:", payload);
      toast.success(`${payload.notification?.title}: ${payload.notification?.body}`, {
        icon: "🔔",
        duration: 5000,
      });
    });

    return () => unsubscribe();
  }, []);

  // 4. Live Firestore Notifications Listener
  useEffect(() => {
    // Only listen if user is authenticated to avoid permission-denied
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setNotifications([]);
        return;
      }

      const q = query(
        collection(db, "erp_notifications"),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Notification[];

        setNotifications(docs);
        setUnreadCount(docs.filter(n => !n.read).length);
      }, (error) => {
        if (error.code === 'permission-denied') {
          console.warn("[useNotifications] Firestore permission denied. Check your security rules.");
        }
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  return {
    notifications,
    unreadCount,
    fcmToken,
    requestPermission,
  };
};
