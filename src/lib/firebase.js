import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "chat-project-a1204.firebaseapp.com",
  projectId: "chat-project-a1204",
  storageBucket: "chat-project-a1204.firebasestorage.app",
  messagingSenderId: "418608816756",
  appId: "1:418608816756:web:11e0da8f46492adc1b2721",
  measurementId: "G-2W9SCBS3RB"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()