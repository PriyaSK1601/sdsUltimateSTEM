import React from "react";
import { useNavigate } from "react-router-dom";


function AdminTournament() {
    const navigate = useNavigate();

    return (
        <div className="admin-tournament">
            <h1 className="page-title">Admin Tournament Page</h1>

            <div className="rounds-container">
                <div className="round-section current">
                    <h2>Current Round</h2>
                    <div className="timer-box">
                        
                    </div>
                </div>

                <div className="round-section next">
                    <h2>Next Round</h2>
                    <div className="timer-box">
                        
                    </div>
                </div>
            </div>

            <div className="admin-buttons">
                <button>Edit Countdown</button>
                <button>Create Submissions</button>
                <button onClick={() => navigate("/view-submissions")}>View Submissions</button>
            </div>
        </div>
    );
}

export default AdminTournament;
