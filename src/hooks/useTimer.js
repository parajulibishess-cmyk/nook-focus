import { useState, useEffect, useRef } from 'react';

// Pre-load audio outside component to prevent re-creation
const timerAudio = typeof Audio !== "undefined" ? new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3") : null;

export const useTimer = (settings, onTimerComplete) => {
  const [mode, setMode] = useState('focus'); // focus, short, long
  const [timeLeft, setTimeLeft] = useState(settings.durations.focus * 60);
  const [isActive, setIsActive] = useState(false);
  const [endTime, setEndTime] = useState(null);
  const [isIntermission, setIsIntermission] = useState(false);
  
  // Ref for the interval to clear it cleanly
  const intervalRef = useRef(null);

  // Update time when settings change, but only if not active
  useEffect(() => {
    if (!isActive && !isIntermission) {
      setTimeLeft(settings.durations[mode] * 60);
    }
  }, [settings.durations, mode, isActive, isIntermission]);

  useEffect(() => {
    if (isActive && endTime) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const diff = Math.ceil((endTime - now) / 1000);
        
        if (diff <= 0) {
          setTimeLeft(0);
          setIsActive(false);
          setEndTime(null);
          handleCompletion();
          clearInterval(intervalRef.current);
        } else {
            // OPTIMIZATION: Only trigger a re-render if the integer second has actually changed.
            // Previously this ran 4x a second, forcing the whole App to re-render 4x a second.
            setTimeLeft(prev => (prev === diff ? prev : diff));
        }
      }, 200); // Check frequently to catch the second boundary, but update state rarely
    } else {
        clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, endTime]);

  const startTimer = () => { setIsIntermission(false); setEndTime(Date.now() + timeLeft * 1000); setIsActive(true); };
  const pauseTimer = () => { setIsActive(false); setEndTime(null); };

  const handleCompletion = () => {
    if(timerAudio) timerAudio.play().catch(e => console.error(e));
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

  return { 
    mode, 
    setMode,
    timeLeft, 
    isActive, 
    isIntermission, 
    startTimer, 
    pauseTimer, 
    finishIntermission, 
    calculateProgress: () => ((settings.durations[mode] * 60 - timeLeft) / (settings.durations[mode] * 60)) * 100 
  };
};