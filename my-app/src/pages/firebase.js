// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


const firebaseConfig = {
  apiKey: "AIzaSyArCmx696emripKnC7wCWhYfvDHwql21EU",
  authDomain: "ultimate-stem.firebaseapp.com",
  projectId: "ultimate-stem",
  storageBucket: "ultimate-stem.firebasestorage.app",
  messagingSenderId: "641943210134",
  appId: "1:641943210134:web:a9633f2a37f35b842a1ab7",
  measurementId: "G-RK47E6EGP2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth=getAuth();
export const db=getFirestore(app);
export default app;