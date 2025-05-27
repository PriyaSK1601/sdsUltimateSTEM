// components/AdminAnalytics.js
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../pages/firebase";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "Analytics"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setAnalytics(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="content-container mt-5">
      <h2 className="mb-3">📊 Real-Time Analytics</h2>
      <ul className="list-group">
        {analytics.map((entry, index) => (
          <li key={index} className="list-group-item">
            <strong>User:</strong> {entry.uid} | <strong>Page:</strong> {entry.page} |{" "}
            <strong>Time:</strong> {entry.timestamp?.toDate().toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminAnalytics;
