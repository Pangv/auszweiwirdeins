import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

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

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  // @ts-ignore
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  console.log("Connected!");
}

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaEnterpriseProvider('6Lcnn14sAAAAAGTwY3HB8exwE7obTLDWaHgnt0v2'),
  isTokenAutoRefreshEnabled: true // Erneuert das Token automatisch im Hintergrund
});
