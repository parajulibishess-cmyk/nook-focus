import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

// Pre-load audio outside component to prevent re-creation
const timerAudio = typeof Audio !== "undefined" ? new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3") : null;

export const useTimer = (settings, onTimerComplete) => {
  const [mode, setMode] = useState('focus'); // focus, short, long
  const [timeLeft, setTimeLeft] = useState(settings.durations.focus * 60);
  // NEW: Track the initial duration of the *current* active timer for accurate percentage
  const [initialDuration, setInitialDuration] = useState(settings.durations.focus * 60);
  
  const [isActive, setIsActive] = useState(false);
  const [endTime, setEndTime] = useState(null);
  const [isIntermission, setIsIntermission] = useState(false);
  
  // Ref for the interval to clear it cleanly
  const intervalRef = useRef(null);

  // Update time when settings change, but only if not active
  useEffect(() => {
    if (!isActive && !isIntermission) {
      const t = settings.durations[mode] * 60;
      setTimeLeft(t);
      setInitialDuration(t); // Sync initial duration
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
            setTimeLeft(prev => (prev === diff ? prev : diff));
        }
      }, 200); 
    } else {
        clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, endTime]);

  // WRAPPED IN CALLBACK to prevent recreation on every render
  const startTimer = useCallback(() => { 
      setIsIntermission(false); 
      setEndTime(Date.now() + timeLeft * 1000); 
      setIsActive(true); 
  }, [timeLeft]);

  const pauseTimer = useCallback(() => { 
      setIsActive(false); 
      setEndTime(null); 
  }, []);

  // NEW: Atomic function to switch mode and start timer immediately
  // This avoids stale state issues when trying to auto-start via effects
  const startSession = useCallback((newMode) => {
      setMode(newMode);
      const dur = settings.durations[newMode] * 60;
      setTimeLeft(dur);
      setInitialDuration(dur);
      setEndTime(Date.now() + dur * 1000);
      setIsActive(true);
      setIsIntermission(false);
  }, [settings]);

  const handleCompletion = () => {
    if(timerAudio) timerAudio.play().catch(e => console.error(e));
    if (onTimerComplete) onTimerComplete(mode, mode === 'focus');
  };

  const finishIntermission = useCallback((action, nextMode = 'short') => {
    setIsIntermission(false);
    if (action === 'extend') {
      const extra = settings.flowDuration * 60;
      setTimeLeft(extra);
      setInitialDuration(extra); // Set total to extension duration
      setEndTime(Date.now() + extra * 1000);
      setIsActive(true);
    } else if (action === 'break') {
      const next = nextMode; 
      setMode(next);
      const dur = settings.durations[next] * 60;
      setTimeLeft(dur);
      setInitialDuration(dur); // Set total to break duration
      if (settings.autoStartBreaks) {
        setEndTime(Date.now() + dur * 1000);
        setIsActive(true);
      }
    }
  }, [settings]);

  const calculateProgress = useCallback(() => {
    // Use initialDuration to ensure 100% is always the full specific session
    if (initialDuration === 0) return 0;
    return ((initialDuration - timeLeft) / initialDuration) * 100;
  }, [initialDuration, timeLeft]);

  // WRAPPED IN MEMO to ensure referential stability when values haven't changed
  return useMemo(() => ({ 
    mode, 
    setMode,
    timeLeft, 
    isActive, 
    isIntermission, 
    initialDuration, // Expose this
    startTimer, 
    pauseTimer,
    startSession, // Export new function
    finishIntermission, 
    calculateProgress
  }), [mode, timeLeft, isActive, isIntermission, initialDuration, startTimer, pauseTimer, startSession, finishIntermission, calculateProgress]);
};