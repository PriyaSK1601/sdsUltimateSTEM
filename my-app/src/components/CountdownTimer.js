import React, { useEffect, useState } from "react";
import "../styles/CountdownTimer.css";

function CountdownTimer({ targetDate, isActive }) {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // This effect handles checking if there's been an external change to current round
    if (isActive) {
      const checkCurrentRound = setInterval(() => {
        const savedTournament = localStorage.getItem("tournamentData");
        if (savedTournament) {
          const tournamentData = JSON.parse(savedTournament);
          const currentRoundIndex = tournamentData.currentRound;

          if (currentRoundIndex < tournamentData.rounds.length) {
            const currentTargetDate =
              tournamentData.rounds[currentRoundIndex].targetDate;

            // If we notice the target date has changed externally (e.g., round change)
            if (currentTargetDate !== targetDate) {
              console.log(
                `Detected round change in CountdownTimer: ${targetDate} → ${currentTargetDate}`
              );
              // Trigger a re-render of parent components by dispatching storage event
              window.dispatchEvent(new Event("storage"));
            }
          }
        }
      }, 1000);

      return () => clearInterval(checkCurrentRound);
    }
  }, [isActive, targetDate]);

  const [transitionHandled, setTransitionHandled] = useState(false);
  useEffect(() => {
    setTransitionHandled(false);
  }, [targetDate]);

  useEffect(() => {
    if (!isActive) {
      setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setIsExpired(true);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();

      if (difference <= 0) {
        /*setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };*/
        setIsExpired(true);

        if (!transitionHandled) {
          setTransitionHandled(true);

          setTimeout(() => {
            const savedTournament = localStorage.getItem("tournamentData");
            if (savedTournament) {
              const tournamentData = JSON.parse(savedTournament);
              const currentRoundIndex = tournamentData.currentRound;

              // If there's another round available, advance to it
              if (currentRoundIndex < tournamentData.rounds.length - 1) {
                const nextRoundIndex = currentRoundIndex + 1;
                tournamentData.currentRound = nextRoundIndex;
                localStorage.setItem(
                  "tournamentData",
                  JSON.stringify(tournamentData)
                );
                console.log(`Advanced to round ${nextRoundIndex + 1}`);
              } else {
                // This was the final round - automatically reset the tournament
                console.log(
                  "Tournament has completed all rounds - resetting data"
                );
                localStorage.removeItem("tournamentData");
              }
            }
          }, 1000);
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      setIsExpired(false);

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeRemaining(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, isActive, transitionHandled]);

  const formatNumber = (num) => {
    return num.toString().padStart(2, "0");
  };

  return (
    <div className="countdown-timer my-4">
      {isExpired && isActive ? (
        <div className="countdown-expired text-center">
          <h2>The current round has ended!</h2>
        </div>
      ) : (
        <div className="row justify-content-center text-center countdown-values">
          <div className="col-sm-2 countdown-item">
            <div className="countdown-value">
              {formatNumber(timeRemaining.days)}
            </div>
            <div className="fw-bold countdown-label">DAYS</div>
          </div>
          <div className="col-sm-2 countdown-item">
            <div className="countdown-value">
              {formatNumber(timeRemaining.hours)}
            </div>
            <div className="fw-bold countdown-label">HOURS</div>
          </div>
          <div className="col-sm-2 countdown-item">
            <div className="countdown-value">
              {formatNumber(timeRemaining.minutes)}
            </div>
            <div className="fw-bold countdown-label">MINS</div>
          </div>
          <div className="col-sm-2 countdown-item">
            <div className="countdown-value">
              {formatNumber(timeRemaining.seconds)}
            </div>
            <div className="fw-bold countdown-label">SECS</div>
          </div>
        </div>
      )}
    </div>
  );
}
export default CountdownTimer;
