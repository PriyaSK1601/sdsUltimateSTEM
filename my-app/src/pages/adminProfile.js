import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import "../styles/adminProfile.css";

function AdminProfile() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = [];
        querySnapshot.forEach((doc) => {
          usersData.push({ id: doc.id, ...doc.data() });
        });
        setUsers(usersData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users: ", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate("/adminLogin");
    });
  };

  if (loading) {
    return <div className="admin-container">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <h2>Admin Dashboard</h2>
      <div className="admin-header">
        <h3>User Analytics</h3>
        <p>Total Users: {users.length}</p>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Display Name</th>
              <th>Last Login</th>
              <th>Account Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.displayName || "N/A"}</td>
                <td>{user.lastLoginAt ? new Date(parseInt(user.lastLoginAt)).toLocaleString() : "N/A"}</td>
                <td>{user.createdAt ? new Date(parseInt(user.createdAt)).toLocaleString() : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminProfile;