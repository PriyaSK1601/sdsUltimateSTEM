import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";
import "bootstrap/dist/css/bootstrap.min.css";
import profileIcon from "../assets/profile_icon.png";
import { auth, db } from "./firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import AdminAnalytics from "../components/adminAnalytics";
import { logPageVisit } from "../utils/analytics";

function Profile() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const fetchUserData = async () => {
          try {
            const userDocRef = doc(db, "Users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setUserData(userDoc.data());
              console.log("User data fetched:", userDoc.data());
            } else {
              console.log("No user document found.");
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        };

        fetchUserData();

        logPageVisit(currentUser.uid, "Profile");
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate("/login");
    });
  };

  const handleEditCountdown = () => {
    navigate("/edit-countdown");
  };

  const getFullName = () => {
    if (userData && userData.firstName && userData.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    } else if (userData && userData.firstName) {
      return userData.firstName;
    } else if (user && user.displayName) {
      return user.displayName;
    }
    return user?.email?.split("@")[0] || "User";
  };

  return (
    <div className="container-fluid py-4">
      {user && (
        <>
          <div className="row">
            <div className="col-md-5">
              <div className="content-container">
                {user.email === "admin@gmail.com" ? (
                  <div>
                    <h2 className="mb-4">Approve Submissions</h2>
                    {/*NOTE: This is just a placeholder item box -- TB REPLACED WITH ACTUAL CONTENT*/}
                    <div className="item-box"></div>
                  </div>
                ) : (
                  <div>
                    <h2 className="mb-4">Previous Submissions</h2>
                    {/*NOTE: This is just a placeholder item box -- TB REPLACED WITH ACTUAL CONTENT*/}
                    <div className="item-box"></div>{" "}
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-7">
              <div className="profile-header mb-4">
                <div className="d-flex align-items-center">
                  <div className="profile-img-container">
                    {userData?.photo ? (
                      <img
                        src={userData.photo}
                        alt="Profile"
                        className="img-fluid rounded-circle"
                      />
                    ) : (
                      <img src={profileIcon} alt="Profile" />
                    )}
                  </div>
                  <div className="ms-4">
                    <h1>{getFullName()}</h1>
                    <p className="lead">{user.email}</p>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="emailNotifcations"
                      />
                      <label
                        className="form-check-label"
                        htmlFor="emailNotifications"
                      >
                        Email notifications
                      </label>
                    </div>
                    <button
                      className="btn btn-secondary mt-3"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
              <div className="content-container">
                {user.email === "admin@gmail.com" ? (
                  <div>
                    <h2 className="mb-4">Admin Tools</h2>
                    <div className="py-1">
                      <button
                        className="btn btn-secondary"
                        onClick={handleEditCountdown}
                      >
                        Edit countdown
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="mb-4">Previous Votes</h2>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div className="item-box"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {user.email === "admin@gmail.com" && (
                <div className="row">
                  <div className="col-md-12">
                    <AdminAnalytics />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;
