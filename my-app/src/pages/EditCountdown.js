import React, { useState, useEffect } from "react";
import CountdownTimer from "../components/CountdownTimer";

function EditCountdown() {
  const initialiseFromStorage = () => {
    const savedData = localStorage.getItem("tournamentData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return {
        numRounds: parsedData.rounds.length,
        rounds: parsedData.rounds,
        isEditing: true,
        tournamentActive: parsedData.isActive,
      };
    }
    return {
      numRounds: 1,
      rounds: [{ name: "Round 1", targetDate: "", index: 0 }],
      isEditing: false,
      tournamentActive: false,
    };
  };

  const initialState = initialiseFromStorage();
  const [numRounds, setNumRounds] = useState(initialState.numRounds);
  const [rounds, setRounds] = useState(initialState.rounds);
  const [isEditing, setIsEditing] = useState(initialState.isEditing);
  const [tournamentActive, setTournamentActive] = useState(
    initialState.tournamentActive
  );

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "tournamentData" || e.key === null) {
        setRefreshKey((prevKey) => prevKey + 1);
      }
    };
    const intervalID = setInterval(() => {
      const freshData = localStorage.getItem("tournamentData");
      if (freshData) {
        const parsedFreshData = JSON.parse(freshData);
        setRounds(parsedFreshData.rounds);
        setNumRounds(parsedFreshData.rounds.length);
        setIsEditing(true);
        setTournamentActive(parsedFreshData.isActive);
        setRefreshKey((prevKey) => prevKey + 1); // Trigger re-render
      } else if (isEditing) {
        setNumRounds(1);
        setRounds([{ name: "Round 1", targetDate: "", index: 0 }]);
        setIsEditing(false);
        setTournamentActive(false);
      }
    }, 2000); // match Tournament page interval

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(intervalID);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshKey]);

  // Update rounds when numRounds changes
  useEffect(() => {
    if (!isEditing) {
      const updatedRounds = [];

      // Keep existing rounds data if available
      for (let i = 0; i < numRounds; i++) {
        if (i < rounds.length) {
          updatedRounds.push(rounds[i]);
        } else {
          updatedRounds.push({
            name: `Round ${i + 1}`,
            targetDate: "",
            index: i,
          });
        }
      }

      setRounds(updatedRounds);
    }
  }, [numRounds]);

  const handleNumRoundsChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 10) {
      setNumRounds(value);
    }
  };

  const handleRoundNameChange = (index, value) => {
    const updatedRounds = [...rounds];
    updatedRounds[index] = { ...updatedRounds[index], name: value };
    setRounds(updatedRounds);
  };

  const handleDateChange = (index, value) => {
    const updatedRounds = [...rounds];
    updatedRounds[index] = { ...updatedRounds[index], targetDate: value };
    setRounds(updatedRounds);
  };

  const validateDates = () => {
    // Ensure all dates are filled and in chronological order
    for (let i = 0; i < rounds.length; i++) {
      if (!rounds[i].targetDate) {
        alert(`Please set a date and time for ${rounds[i].name}`);
        return false;
      }

      const currentDate = new Date(rounds[i].targetDate);

      // Ensure date is in the future
      if (i === 0 && currentDate <= new Date()) {
        alert(`${rounds[0].name} must be set in the future`);
        return false;
      }

      // Ensure dates are in chronological order
      if (i > 0) {
        const prevDate = new Date(rounds[i - 1].targetDate);
        if (currentDate <= prevDate) {
          alert(`${rounds[i].name} must be after ${rounds[i - 1].name}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleStartTournament = () => {
    if (!validateDates()) return;

    // Convert dates to ISO strings
    const updatedRounds = rounds.map((round) => ({
      ...round,
      targetDate: new Date(round.targetDate).toISOString(),
    }));

    // Create tournament data object
    const tournamentData = {
      rounds: updatedRounds,
      currentRound: 0,
      isActive: true,
      startTime: new Date().toISOString(),
    };

    // Save to localStorage
    localStorage.setItem("tournamentData", JSON.stringify(tournamentData));

    // Update state
    setRounds(updatedRounds);
    setIsEditing(true);
    setTournamentActive(true);
  };

  const handleResetTournament = () => {
    // Remove from localStorage
    localStorage.removeItem("tournamentData");

    // Reset state
    setNumRounds(1);
    setRounds([{ name: "Round 1", targetDate: "", index: 0 }]);
    setIsEditing(false);
    setTournamentActive(false);
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getCurrentRoundData = () => {
    const savedTournament = localStorage.getItem("tournamentData");
    if (savedTournament) {
      const tournamentData = JSON.parse(savedTournament);
      const currentRoundIndex = tournamentData.currentRound;

      if (currentRoundIndex < tournamentData.rounds.length) {
        return {
          name: tournamentData.rounds[currentRoundIndex].name,
          targetDate: tournamentData.rounds[currentRoundIndex].targetDate,
          currentRound: currentRoundIndex,
          totalRounds: tournamentData.rounds.length,
          isActive: tournamentData.isActive,
        };
      }
    }
    return null;
  };

  const currentRoundData = getCurrentRoundData();

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header text-center bg-light fw-bold">
              <h2>Edit Tournament Countdown</h2>
            </div>
            <div className="card-body">
              {isEditing && currentRoundData && (
                <div className="bg-light rounded p-4 mb-4">
                  <h4 className="text-center">Current Tournament Status</h4>
                  <h5 className="text-center mb-3">
                    {currentRoundData.name} ({currentRoundData.currentRound + 1}{" "}
                    of {currentRoundData.totalRounds})
                  </h5>

                  <CountdownTimer
                    key={`countdown-${currentRoundData.targetDate}`}
                    targetDate={currentRoundData.targetDate}
                    isActive={tournamentActive}
                  />

                  <div className="text-center mt-3 fw-500">
                    Status: {tournamentActive ? "Active" : "Stopped"}
                  </div>
                  <div className="text-center mt-2">
                    <strong>End Date and Time: </strong>
                    {formatDateTime(currentRoundData.targetDate)}
                  </div>
                </div>
              )}

              <form>
                {!isEditing ? (
                  <>
                    <div className="mb-4">
                      <label className="form-label">
                        Number of Tournament Rounds
                      </label>
                      <input
                        className="form-control"
                        type="number"
                        min="1"
                        max="10"
                        value={numRounds}
                        onChange={handleNumRoundsChange}
                      />
                    </div>

                    {rounds.map((round, index) => (
                      <div key={index} className="mb-4 p-3 border rounded">
                        <h5>{`Round ${index + 1}`}</h5>

                        <div className="mb-3">
                          <label className="form-label">Round Name</label>
                          <input
                            className="form-control"
                            type="text"
                            value={round.name}
                            onChange={(e) =>
                              handleRoundNameChange(index, e.target.value)
                            }
                            placeholder="Enter round name"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label">
                            End Date and Time
                          </label>
                          <input
                            className="form-control"
                            type="datetime-local"
                            value={round.targetDate}
                            onChange={(e) =>
                              handleDateChange(index, e.target.value)
                            }
                            min={new Date().toISOString().slice(0, 16)}
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      className="btn btn-secondary w-100 mb-3"
                      onClick={handleStartTournament}
                      type="button"
                    >
                      Start Tournament
                    </button>
                  </>
                ) : (
                  <div className="mt-4 mb-4">
                    <div className="mb-4">
                      <h5>All Tournament Rounds</h5>
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Round Name</th>
                              <th>End Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rounds.map((round, index) => (
                              <tr
                                key={index}
                                className={
                                  currentRoundData &&
                                  index === currentRoundData.currentRound
                                    ? "table-active"
                                    : ""
                                }
                              >
                                <td>{index + 1}</td>
                                <td>{round.name}</td>
                                <td>{formatDateTime(round.targetDate)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <button
                      className="btn btn-secondary w-100 mb-3"
                      onClick={handleResetTournament}
                      type="button"
                    >
                      Reset Tournament
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
