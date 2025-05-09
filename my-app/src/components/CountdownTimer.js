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
    if (!isActive) {
      setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      setIsExpired(true);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();

      if (difference <= 0) {
        setIsExpired(true);
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
  }, [targetDate, isActive]);

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
