import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCv_f10d1H0XxjYCpZeI_0NuAQibv7Cp5E",
    authDomain: "wishlist-couple.firebaseapp.com",
    projectId: "wishlist-couple",
    storageBucket: "wishlist-couple.firebasestorage.app",
    messagingSenderId: "733085795389",
    appId: "1:733085795389:web:f6dbac08b4049f386c1654"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);