import React, { useState, useEffect } from 'react';

const Countdown = ({ eventDate }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const eventTime = new Date(eventDate);
            const difference = eventTime - now;

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / (1000 * 60)) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [eventDate]);

    return (
        <div className="countdown">
            <h3>Next Event Starts In:</h3>
            <div className="countdown-timer">
                <div className="countdown-item">
                    <span className="countdown-number">{timeLeft.days}</span>
                    <span className="countdown-label">Days</span>
                </div>
                <div className="countdown-item">
                    <span className="countdown-number">{timeLeft.hours}</span>
                    <span className="countdown-label">Hours</span>
                </div>
                <div className="countdown-item">
                    <span className="countdown-number">{timeLeft.minutes}</span>
                    <span className="countdown-label">Minutes</span>
                </div>
                <div className="countdown-item">
                    <span className="countdown-number">{timeLeft.seconds}</span>
                    <span className="countdown-label">Seconds</span>
                </div>
            </div>
        </div>
    );
};

export default Countdown;