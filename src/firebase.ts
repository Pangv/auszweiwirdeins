import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// HINWEIS: Diese Konfiguration muss mit den echten Daten aus der Firebase Console ersetzt werden.
// Da ich keinen Zugriff auf die Console habe, erstelle ich ein Template.
const firebaseConfig = {
  apiKey: "AIzaSyCgvhypMbEMxcB27MSwMVGHXDinrDaL3KY",
  authDomain: "kommrum-895d1.firebaseapp.com",
  projectId: "kommrum-895d1",
  storageBucket: "kommrum-895d1.firebasestorage.app",
  messagingSenderId: "361792781378",
  appId: "1:361792781378:web:3f1fa10e754da406fb41db"
};


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
