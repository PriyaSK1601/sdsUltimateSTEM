import React, { useState, useEffect } from "react";
import CountdownTimer from "../components/CountdownTimer";

function EditCountdown() {
  const [countdownData, setCountdownData] = useState({
    targetDate: "",
    isActive: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [displayDate, setDisplayDate] = useState("");

  useEffect(() => {
    const savedCountdown = localStorage.getItem("tournamentCountdown");
    if (savedCountdown) {
      const parsedData = JSON.parse(savedCountdown);
      setCountdownData(parsedData);
      setDisplayDate(
        new Date(parsedData.targetDate).toISOString().slice(0, 16)
      );
      setIsEditing(true);
    }
  }, []);

  const handleDateChange = (e) => {
    setDisplayDate(e.target.value);
    setCountdownData({
      ...countdownData,
      targetDate: e.target.value,
    });
  };

  const handleStartCountdown = () => {
    const targetDateISOString = new Date(displayDate).toISOString();

    const newCountdownData = {
      targetDate: targetDateISOString,
      isActive: true,
    };

    // Save to localStorage
    localStorage.setItem(
      "tournamentCountdown",
      JSON.stringify(newCountdownData)
    );

    // Update state
    setCountdownData(newCountdownData);
    setIsEditing(true);
  };

  const handleResetCountdown = () => {
    // Remove from localStorage
    localStorage.removeItem("tournamentCountdown");

    // Reset state
    setCountdownData({
      targetDate: "",
      isActive: false,
    });
    setDisplayDate("");
    setIsEditing(false);
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header text-center bg-light fw-bold">
              <h2>Edit Tournament Countdown</h2>
            </div>
            <div className="card-body">
              {isEditing && (
                <div className="bg-light rounded p-4 mb-4">
                  <h4 className="text-center">Current Countdown</h4>
                  <CountdownTimer
                    targetDate={countdownData.targetDate}
                    isActive={countdownData.isActive}
                  />
                  <div className="text-center mt-3 fw-500">
                    Status: {countdownData.isActive ? "Active" : "Stopped"}
                  </div>
                  <div className="text-center mt-2">
                    <strong>End Date and Time: </strong>
                    {formatDateTime(countdownData.targetDate)}
                  </div>
                </div>
              )}

              <form>
                {!isEditing ? (
                  <>
                    <div className="mb-4">
                      <label className="form-label">
                        Set Countdown End Date and Time
                      </label>
                      <input
                        className="form-control"
                        type="datetime-local"
                        value={displayDate}
                        onChange={handleDateChange}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    <button
                      className="btn btn-secondary w-100 mb-3"
                      onClick={handleStartCountdown}
                      type="button"
                    >
                      Start Tournament
                    </button>
                  </>
                ) : (
                  <div className="mt-4 mb-4">
                    <button
                      className="btn btn-secondary w-100 mb-3"
                      onClick={handleResetCountdown}
                      type="button"
                    >
                      Reset Countdown
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default EditCountdown;
