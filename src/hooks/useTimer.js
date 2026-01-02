import { useState, useEffect } from 'react';

// Pre-load audio outside component to prevent re-creation
const timerAudio = typeof Audio !== "undefined" ? new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3") : null;

export const useTimer = (settings, onTimerComplete) => {
  const [mode, setMode] = useState('focus'); // focus, short, long
  const [timeLeft, setTimeLeft] = useState(settings.durations.focus * 60);
  const [isActive, setIsActive] = useState(false);
  const [endTime, setEndTime] = useState(null);
  const [isIntermission, setIsIntermission] = useState(false);
  const [intermissionTimeLeft, setIntermissionTimeLeft] = useState(0);

  // Update time when settings change, but only if not active
  useEffect(() => {
    if (!isActive && !isIntermission) {
      setTimeLeft(settings.durations[mode] * 60);
    }
  }, [settings.durations, mode]);

  useEffect(() => {
    let interval = null;
    if (isActive && endTime) {
      interval = setInterval(() => {
        const diff = Math.ceil((endTime - Date.now()) / 1000);
        if (diff <= 0) {
          setTimeLeft(0);
          setIsActive(false);
          setEndTime(null);
          handleCompletion();
        } else {
          setTimeLeft(diff);
        }
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isActive, endTime]);

  const startTimer = () => { setIsIntermission(false); setEndTime(Date.now() + timeLeft * 1000); setIsActive(true); };
  const pauseTimer = () => { setIsActive(false); setEndTime(null); };

  const handleCompletion = () => {
    if(timerAudio) timerAudio.play().catch(e => console.error(e));
    
    // If we finished a focus session, we check "autoStartBreaks" etc in the App component via callback
    // But basic mode switching logic happens here or in App
    if (onTimerComplete) onTimerComplete(mode, mode === 'focus');
  };

  const finishIntermission = (action) => {
    setIsIntermission(false);
    if (action === 'extend') {
      const extra = settings.flowDuration * 60;
      setTimeLeft(extra);
      setEndTime(Date.now() + extra * 1000);
      setIsActive(true);
    } else if (action === 'break') {
      const next = 'short'; // Logic for long break can be added here
      setMode(next);
      const dur = settings.durations[next] * 60;
      setTimeLeft(dur);
      if (settings.autoStartBreaks) {
        setEndTime(Date.now() + dur * 1000);
        setIsActive(true);
      }
    }
  };

  return { 
    mode, 
    setMode, // EXPOSED THIS
    timeLeft, 
    isActive, 
    isIntermission, 
    startTimer, 
    pauseTimer, 
    finishIntermission, 
    calculateProgress: () => ((settings.durations[mode] * 60 - timeLeft) / (settings.durations[mode] * 60)) * 100 
  };
};