// utils/analytics.js

import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import app from "../pages/firebase"; // adjust this if needed

const db = getFirestore(app);

// ✅ Function to log visits
export async function logPageVisit(userId, pageName) {
  try {
    await addDoc(collection(db, "pageVisits"), {
      userId,
      page: pageName,
      timestamp: serverTimestamp()
    });
    console.log("Page visit logged:", pageName);
  } catch (error) {
    console.error("Error logging page visit:", error);
  }
}

