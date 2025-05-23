import "bootstrap/dist/css/bootstrap.min.css";
import { onAuthStateChanged, signOut, updatePassword } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import profileIcon from "../assets/profile_icon.png";
import "../styles/profile.css";
import { logPageVisit } from "../utils/analytics";
import { auth, db } from "./firebase";

function Profile() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const navigate = useNavigate();
  const [isEditing, setIsEditing]           = useState(false);
  const [editedSubmission, setEditedSubmission] = useState(null);

  //Fetch submissions based on admin/user
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
      fetchSubmissions(); //Get all pending submissions
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
        fetchUserSubmissions(); //Get all submissions with matching author name and getFullName()
      }
    }
  }, [user]);

  //Gets users full name
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

  //Check if user is logged in
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

  // Logout
  const handleLogout = () => {
    signOut(auth).then(() => {
      navigate("/login");
    });
  };

  //Edit Profile
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

  //Admin tools: navigate to edit countdown
  const handleEditCountdown = () => {
    navigate("/edit-countdown");
  };

  //Admin tools: navigate to view all submissions
  const handleViewAllSubmissions = () => {
    navigate("/viewAllSubmissions");
  }

  //Admin tools: reset votes for all submissions
  const emptyVotes = {
    round1: Array(8).fill(null),
    round2: Array(4).fill(null),
    round3: Array(2).fill(null),
    round4: Array(1).fill(null),
  };
  
  const resetVotesForAll = async () => {
    if (window.confirm("Are you sure you want to reset votes for ALL submissions?")) {
      try {
        const res = await fetch("http://localhost:3001/submissions/reset-votes", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Reset failed");
        localStorage.setItem("tournamentVotes", JSON.stringify(emptyVotes));
        window.dispatchEvent(new Event("tournamentVotesReset"));
        alert("Votes have been reset for all submissions.");
      } catch (err) {
        console.error("Failed to reset votes:", err);
        alert("Failed to reset votes for all submissions.");
      }
    }
  };


  //Admin profile: approve submission
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
  
  //Admin profile: decline submission
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

  //Edit button logic
  const startEditing = (submission) => {
    setIsEditing(true);
    // shallow-copy so we can edit fields locally
    setEditedSubmission({ ...submission });
  };
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setEditedSubmission((prev) => ({ ...prev, [name]: value }));
  };

  //Save submission edits 
  const saveProfileEdit = async () => {
    if (!editedSubmission) return;
    try {
      const res = await fetch(
        `http://localhost:3001/submissions/${editedSubmission._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editedSubmission),
        }
      );
      if (!res.ok) throw new Error("Save failed");

      // update local list
      setSubmissions((prev) =>
        prev.map((s) => (s._id === editedSubmission._id ? editedSubmission : s))
      );
      toast.success("Submission updated!");
      setIsEditing(false);
      setEditedSubmission(null);
    } catch (err) {
      toast.error("Edit failed: " + err.message);
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
                        submissions.map((submission) => (
                          <div className="view-submission-card" key={submission._id}>
                            {submission.image && (
                              <img
                                className="view-card-image"
                                src={`http://localhost:3001/image/${submission._id}`}
                                alt={submission.title}
                              />
                            )}
                            <div className="card-content">
                              {/* CATEGORY */}
                              <div className="category">
                                {isEditing && editedSubmission?._id === submission._id ? (
                                  <input
                                    name="category"
                                    value={editedSubmission.category}
                                    onChange={handleProfileInputChange}
                                    className="form-control"
                                  />
                                ) : (
                                  submission.category
                                )}
                              </div>

                              {/* TITLE */}
                              <div className="heading">
                                {isEditing && editedSubmission?._id === submission._id ? (
                                  <input
                                    name="title"
                                    value={editedSubmission.title}
                                    onChange={handleProfileInputChange}
                                    className="form-control"
                                  />
                                ) : (
                                  submission.title
                                )}
                              </div>

                              {/* DESCRIPTION */}
                              <div className="description">
                                {isEditing && editedSubmission?._id === submission._id ? (
                                  <textarea
                                    name="description"
                                    value={editedSubmission.description}
                                    onChange={handleProfileInputChange}
                                    className="form-control"
                                  />
                                ) : (
                                  submission.description
                                )}
                              </div>

                              {/* AUTHOR */}
                              <div className="author">
                                Status:&nbsp;
                                <span className="name">{submission.status}</span>&nbsp;|&nbsp;
                                {new Date(submission.entryDate).toLocaleDateString()}
                              </div>

                              {/* BUTTONS: only show Edit / Save when status === "pending" */}
                              {submission.status === "pending" && (
                                <>
                                  {isEditing && editedSubmission?._id === submission._id ? (
                                    <button
                                      className="btn btn-success btn-sm mt-2"
                                      onClick={saveProfileEdit}                                    >
                                      Save
                                    </button>
                                  ) : (
                                    <button
                                      className="btn btn-warning btn-sm mt-2"
                                      onClick={() => startEditing(submission)}>
                                      Edit
                                    </button>
                                  )}
                                </>
                              )}
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
                      <button className="btn btn-secondary w-100" onClick={handleEditCountdown}>
                        Edit countdown
                      </button>
                    </div>
                    <div className="mb-2">
                      <button className="btn btn-secondary w-100" onClick={handleViewAllSubmissions}>
                        View/Restore all submissions
                      </button>
                    </div>
                    <div className="mb-2">
                      <button className="btn btn-secondary w-100" onClick={resetVotesForAll}>
                        Reset All Votes
                      </button>
                    </div>
                    <div className="mb-2">
                      <button
                        className="btn btn-secondary w-100"
                        onClick={() =>
                          window.open(
                            "https://console.firebase.google.com/u/0/project/ultimate-stem/analytics/app/web:MGVjOGI4ZjMtYzNiZi00YTEwLWJjZmUtMzA4ZjJiNzMyOTU5/overview/reports~2Fdashboard%3Fr%3Dfirebase-overview&fpn%3D641943210134",
                            "_blank"
                          )
                        }
                      >
                        View Firebase Analytics
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
      <ToastContainer />
    </div>
  );

};
export default Profile;
