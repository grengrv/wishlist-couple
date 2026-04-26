import { getToken } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { messaging, db } from "@config/firebase";

const VAPID_KEY = "BMfnkf9J_djv07gbTG0Vs2ZNBkcjaItdWZ_7jmqnKmQ3CtXj0gcWHRodyGXDx8wfzfd6oP5TnYRg8k8Nooh1xb0";

export const requestNotificationPermission = async (userId) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Get FCM token
      const token = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (token) {
        // Save the token to Firestore for this user
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
          fcmToken: token,
        });
        console.log("FCM Token saved successfully:", token);
      } else {
        console.log("No registration token available. Request permission to generate one.");
      }
    } else {
      console.log("Notification permission denied.");
    }
  } catch (error) {
    console.error("An error occurred while retrieving token. ", error);
  }
};
