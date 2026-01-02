import { useState, useEffect } from 'react';

export const useTimer = (settings, onTimerComplete) => {
  const [mode, setMode] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(settings.durations.focus * 60);
  const [isActive, setIsActive] = useState(false);
  const [endTime, setEndTime] = useState(null);
  const [isIntermission, setIsIntermission] = useState(false);
  const [intermissionTimeLeft, setIntermissionTimeLeft] = useState(0);

  useEffect(() => {
    if (!isActive && !isIntermission) {
      setTimeLeft(settings.durations[mode] * 60);
    }
  }, [settings.durations, mode]);

  useEffect(() => {
    let interval = null;
    if (isActive && endTime) {
      // UPDATED: Changed from 100 to 250
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
      }, 250); // <--- Changed here
    }
    return () => clearInterval(interval);
  }, [isActive, endTime]);

  useEffect(() => {
    let interval = null;
    if (isIntermission && intermissionTimeLeft > 0) {
      interval = setInterval(() => setIntermissionTimeLeft(p => p - 1), 1000);
    } else if (isIntermission && intermissionTimeLeft <= 0) {
      finishIntermission('break');
    }
    return () => clearInterval(interval);
  }, [isIntermission, intermissionTimeLeft]);

  const startTimer = () => { setIsIntermission(false); setEndTime(Date.now() + timeLeft * 1000); setIsActive(true); };
  const pauseTimer = () => { setIsActive(false); setEndTime(null); };

  const handleCompletion = () => {
    // Note: Consider moving this URL to a local file later for offline support
    new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3").play().catch(e => {});
    if (mode === 'focus') {
      setIntermissionTimeLeft(settings.intermissionDuration);
      setIsIntermission(true);
      if (onTimerComplete) onTimerComplete(mode, true);
    } else {
      if (onTimerComplete) onTimerComplete(mode, false);
      setMode('focus');
      setTimeLeft(settings.durations.focus * 60);
    }
  };

  const finishIntermission = (action) => {
    setIsIntermission(false);
    if (action === 'extend') {
      const extra = settings.flowDuration * 60;
      setTimeLeft(extra);
      setEndTime(Date.now() + extra * 1000);
      setIsActive(true);
    } else if (action === 'break') {
      const next = 'short';
      setMode(next);
      const dur = settings.durations[next] * 60;
      setTimeLeft(dur);
      if (settings.autoStartBreaks) {
        setEndTime(Date.now() + dur * 1000);
        setIsActive(true);
      }
    }
  };

  return { mode, timeLeft, isActive, isIntermission, intermissionTimeLeft, startTimer, pauseTimer, finishIntermission, calculateProgress: () => ((settings.durations[mode] * 60 - timeLeft) / (settings.durations[mode] * 60)) * 100 };
};