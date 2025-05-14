import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/profile.css";
import "bootstrap/dist/css/bootstrap.min.css";
import profileIcon from "../assets/profile_icon.png";
import { auth, db } from "./firebase";
import { signOut, onAuthStateChanged, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AdminAnalytics from "../components/adminAnalytics";
import { logPageVisit } from "../utils/analytics";

function Profile() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch("http://localhost:3001/submissions");
        const data = await response.json();
        // Filter out submissions with status 'approved' or 'declined'
        const pendingSubmissions = data.filter(
          (submission) => submission.status === "pending"
        );
        setSubmissions(pendingSubmissions);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    if (user?.email === "admin@gmail.com") {
      fetchSubmissions();
    }

    if (user?.email !== "admin@gmail.com") {
      const fetchUserSubmissions = async () => {
        console.log("Full name:", getFullName());
        try {
          const response = await fetch("http://localhost:3001/submissions");
          const data = await response.json();
          const userSubmissions = data.filter(
            (submission) =>
              submission.author?.toLowerCase() === getFullName().toLowerCase()
          );
          setSubmissions(userSubmissions);
        } catch (error) {
          console.error("Error fetching user submissions:", error);
        }
      };

      if (user && user.email !== "admin@gmail.com") {
        fetchUserSubmissions();
      }
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email);

        const fetchUserData = async () => {
          try {
            const userDocRef = doc(db, "Users", currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const data = userDoc.data();
              setUserData(data);
              setFirstName(data.firstName || "");
              setLastName(data.lastName || "");
              console.log("User data fetched:", data);
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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);

    // Reset form fields to current values
    if (userData) {
      setFirstName(userData.firstName || "");
      setLastName(userData.lastName || "");
    }
  };

  const handleSave = async () => {
    try {
      if (!user) return;

      // Update name in Firestore
      const userDocRef = doc(db, "Users", user.uid);
      await updateDoc(userDocRef, {
        firstName,
        lastName,
      });

      setUserData((prev) => ({
        ...prev,
        firstName,
        lastName,
      }));

      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (newPassword !== confirmPassword) {
        alert("New passwords don't match");
        return;
      }

      if (newPassword.length < 6) {
        alert("Password must be at least 6 characters");
        return;
      }

      // Update password
      await updatePassword(user, newPassword);

      alert("Password changed successfully!");
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error changing password:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEditCountdown = () => {
    navigate("/edit-countdown");
  };

  const handleViewAllSubmissions = () => {
    navigate("/viewAllSubmissions");
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

  const handleApprove = async (submissionId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/submissions/${submissionId}/approve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Approval failed");
      }

      // Remove approved item from the list locally
      setSubmissions((prev) => prev.filter((sub) => sub._id !== submissionId));
    } catch (error) {
      console.error("Error approving submission:", error);
      alert("Failed to approve submission.");
    }
  };

  const handleDecline = async (submissionId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/submissions/${submissionId}/decline`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Decline failed");
      }

      // Remove declined item from the list locally
      setSubmissions((prev) => prev.filter((sub) => sub._id !== submissionId));
    } catch (error) {
      console.error("Error declining submission:", error);
      alert("Failed to decline submission.");
    }
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
                    {submissions.length > 0 ? (
                      <div className="submissions-scroll-container">
                        <div className="submissions-list">
                          {submissions.map((submission, index) => (
                            <div className="view-submission-card " key={index}>
                              {submission.image ? (
                                <img
                                  className="view-card-image"
                                  src={`http://localhost:3001/image/${submission._id}`}
                                  alt={submission.title}
                                />
                              ) : null}
                              <div className="card-content">
                                <div className="category">
                                  {submission.category}
                                </div>
                                <div className="heading">
                                  {submission.title}
                                </div>
                                <div className="description">
                                  {submission.description}
                                </div>
                                <div className="author">
                                  By{" "}
                                  <span className="name">
                                    {submission.author}
                                  </span>{" "}
                                  {submission.date}
                                </div>
                                <div className="action-button-container">
                                  <button
                                    className=""
                                    onClick={() =>
                                      handleApprove(submission._id)
                                    }
                                  >
                                    Approve
                                  </button>
                                  <button
                                    className=""
                                    onClick={() =>
                                      handleDecline(submission._id)
                                    }
                                  >
                                    Decline
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p>No submissions to review!</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <h2 className="mb-4">Previous Submissions</h2>
                    {}
                    <div className="submissions-scroll-container">
                      <div className="submissions-list">
                        {submissions.length > 0 ? (
                          submissions.map((submission, index) => (
                            <div className="view-submission-card" key={index}>
                              {submission.image && (
                                <img
                                  className="view-card-image"
                                  src={`http://localhost:3001/image/${submission._id}`}
                                  alt={submission.title}
                                />
                              )}
                              <div className="card-content">
                                <div className="category">
                                  {submission.category}
                                </div>
                                <div className="heading">
                                  {submission.title}
                                </div>
                                <div className="description">
                                  {submission.description}
                                </div>
                                <div className="author">
                                  Status:{" "}
                                  <span className="name">
                                    {submission.status}
                                  </span>{" "}
                                  |{" "}
                                  {new Date(
                                    submission.entryDate
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p>You haven't submitted anything yet.</p>
                        )}
                      </div>
                    </div>
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

                  {!isEditing ? (
                    <div className="ms-4">
                      <h1>{getFullName()}</h1>
                      <p className="lead">{user.email}</p>
                      <div className="mt-3 btn-container">
                        <button
                          className="btn btn-secondary me-3"
                          onClick={handleEdit}
                        >
                          Edit Profile
                        </button>
                        <button
                          className="btn btn-outline-secondary"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="ms-4 profile-edit-form">
                      <div className="mb-3">
                        <label htmlFor="firstName" className="form-label">
                          First Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="lastName" className="form-label">
                          Last Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                      {!isChangingPassword ? (
                        <div className="mb-3">
                          <button
                            type="button"
                            className="btn btn-link p-0 text-decoration-none"
                            onClick={() => setIsChangingPassword(true)}
                          >
                            Change Password
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="mb-3">
                            <label
                              htmlFor="currentPasswordForChange"
                              className="form-label"
                            >
                              Current Password
                            </label>
                            <input
                              type="password"
                              className="form-control"
                              id="currentPasswordForChange"
                              value={currentPassword}
                              onChange={(e) =>
                                setCurrentPassword(e.target.value)
                              }
                            />
                          </div>

                          <div className="mb-3">
                            <label htmlFor="newPassword" className="form-label">
                              New Password
                            </label>
                            <input
                              type="password"
                              className="form-control"
                              id="newPassword"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                          </div>

                          <div className="mb-3">
                            <label
                              htmlFor="confirmPassword"
                              className="form-label"
                            >
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              className="form-control"
                              id="confirmPassword"
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                            />
                          </div>

                          <button
                            type="button"
                            className="btn btn-secondary me-3"
                            onClick={handleChangePassword}
                          >
                            Update Password
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                              setIsChangingPassword(false);
                              setNewPassword("");
                              setConfirmPassword("");
                              setCurrentPassword("");
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      <div className="mt-3">
                        {!isChangingPassword && (
                          <>
                            <button
                              className="btn btn-secondary me-3"
                              onClick={handleSave}
                            >
                              Save Changes
                            </button>
                            <button
                              className="btn btn-outline-secondary"
                              onClick={handleCancel}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="content-container">
                {user.email === "admin@gmail.com" ? (
                  <div>
                    <h2 className="mb-4">Admin Tools</h2>
                    <div className="py-1">
                      <div className="mb-2">
                        <button
                          className="btn btn-secondary w-100"
                          onClick={handleEditCountdown}
                        >
                          Edit countdown
                        </button>
                      </div>
                      <div>
                        <button
                          className="btn btn-secondary w-100"
                          onClick={handleViewAllSubmissions}
                        >
                          View/Restore all submissions
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="mb-4">Previous Votes</h2>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="item-box"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;
