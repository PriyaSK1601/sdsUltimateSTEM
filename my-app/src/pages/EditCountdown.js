import React, { useState, useEffect, useRef } from "react";
import CountdownTimer from "../components/CountdownTimer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

function EditCountdown() {
  const numRounds = 4;
  const [rounds, setRounds] = useState([
    { index: 0, name: "Round 1", targetDate: "" },
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [tournamentActive, setTournamentActive] = useState(false);
  const [currentRoundData, setCurrentRoundData] = useState(null);
  const prevDataRef = useRef(null);

  const resetTournament = async () => {
    try {
      await axios.delete("http://localhost:3001/tournament");

      prevDataRef.current = null;
      setRounds([{ index: 0, name: "Round 1", targetDate: "" }]);
      setIsEditing(false);
      setTournamentActive(false);
      setCurrentRoundData(null);

      console.log("Tournament successfully reset!");
    } catch (error) {
      console.log("Error resetting tournament:", error);
    }
  };

  const fetchTournamentData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/tournament");

      if (response.data && response.data.length > 0) {
        // Check if data has actually changed
        const dataString = JSON.stringify(response.data);
        if (dataString === prevDataRef.current) {
          // Data hasn't changed, no need to update state
          return;
        }

        // Store the new data string for future comparison
        prevDataRef.current = dataString;

        // Format rounds for the component state
        const fetchedRounds = response.data.map((round) => ({
          index: round.round,
          name: round.roundName,
          targetDate: new Date(round.endDate).toISOString().slice(0, 16),
        }));

        setRounds(fetchedRounds);
        setIsEditing(true);

        // Find current active round
        const now = new Date();
        const activeRounds = response.data.filter(
          (round) => new Date(round.endDate) > now
        );

        if (activeRounds.length > 0) {
          // Sort by earliest endDate first
          activeRounds.sort(
            (a, b) => new Date(a.endDate) - new Date(b.endDate)
          );
          const currentRound = activeRounds[0];

          setCurrentRoundData({
            currentRound: currentRound.round,
            name: currentRound.roundName,
            targetDate: currentRound.endDate,
            totalRounds: response.data.length,
            isActive: true,
          });

          setTournamentActive(true);
        } else if (response.data.length > 0) {
          // All rounds have expired, reset
          await resetTournament();
        } else {
          setCurrentRoundData(null);
          setTournamentActive(false);
        }
      } else {
        // No tournament data
        // Only update state if there was data previously
        if (prevDataRef.current !== null) {
          prevDataRef.current = null;
          if (!isEditing) {
            setRounds([{ index: 0, name: "Round 1", targetDate: "" }]);
          }
          setIsEditing(false);
          setTournamentActive(false);
          setCurrentRoundData(null);
        }
      }
    } catch (error) {
      console.error("Error fetching tournament data:", error);
      if (!isEditing && prevDataRef.current !== null) {
        prevDataRef.current = null;
        setRounds([{ index: 0, name: "Round 1", targetDate: "" }]);
        setIsEditing(false);
        setTournamentActive(false);
        setCurrentRoundData(null);
      }
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTournamentData();

    //Polling interval to check for updates
    const intervalId = setInterval(() => {
      if (!isEditing) {
        fetchTournamentData();
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isEditing]);

  //
  useEffect(() => {
  if (!isEditing) {
    const updatedRounds = [];

    for (let i = 0; i < 4; i++) {
      updatedRounds.push({
        index: i,
        name: `Round ${i + 1}`,
        targetDate: "",
      });
    }

    setRounds(updatedRounds);
  }
}, [isEditing]);


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
        toast.warning(`Please set a date and time for ${rounds[i].name}`);
        return false;
      }

      const currentDate = new Date(rounds[i].targetDate);

      // Ensure date is in the future
      if (i === 0 && currentDate <= new Date()) {
        toast.warning(`${rounds[0].name} must be set in the future`);
        return false;
      }

      // Ensure dates are in chronological order
      if (i > 0) {
        const prevDate = new Date(rounds[i - 1].targetDate);
        if (currentDate <= prevDate) {
          toast.warning(`${rounds[i].name} must be after ${rounds[i - 1].name}`);
          return false;
        }
      }
    }
    return true;
  };

  const handleStartTournament = async (e) => {
    e.preventDefault(); // Prevent form submission
    if (!validateDates()) return;

    try {
      // Convert dates to ISO strings
      const formattedRounds = rounds.map((round) => ({
        ...round,
        targetDate: new Date(round.targetDate).toISOString(),
      }));

      // Send tournament data
      await axios.post("http://localhost:3001/tournament", {
        rounds: formattedRounds,
      });

      // Update local state
      setIsEditing(true);
      setTournamentActive(true);

      // Clear previous data reference to force refresh
      prevDataRef.current = null;

      // Refresh tournament data from server
      fetchTournamentData();

      toast.success("Tournament started successfully!");
    } catch (error) {
      console.error("Error starting tournament:", error);
      toast.error("Failed to start tournament. Please try again.");
    }
  };

  const handleResetTournament = async (e) => {
    e.preventDefault(); // Prevent form submission
    try {
      await resetTournament();

      toast.success("Tournament reset successfully!");
    } catch (error) {
      console.error("Error resetting tournament:", error);
      toast.error("Failed to reset tournament. Please try again.");
    }
  };

  const handleRoundComplete = () => {
    // Clear previous data reference to force refresh
    prevDataRef.current = null;
    // Refresh tournament data when a round completes
    fetchTournamentData();
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
                    onRoundComplete={handleRoundComplete}
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
     <ToastContainer />
    </div>
  );
}
export default EditCountdown;
