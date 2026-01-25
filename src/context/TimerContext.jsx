import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { useTimer } from '../hooks/useTimer';
import { useSettings } from './SettingsContext';
import { useStats } from './StatsContext';
import { useTasks } from './TaskContext';

const TimerContext = createContext();

export const useTimerContext = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimerContext must be used within a TimerProvider');
  }
  return context;
};

export const TimerProvider = ({ children }) => {
  const settings = useSettings();
  const { stats, setStats, setSeeds } = useStats();
  const { tasks, setTasks, focusedTaskId } = useTasks();
  
  const [showFlowExtend, setShowFlowExtend] = useState(false);
  const [isExtension, setIsExtension] = useState(false);
  
  // NEW: State to trigger auto-start
  const [triggerAutoStart, setTriggerAutoStart] = useState(false);

  const handleTimerComplete = (mode, isFocusSession) => {
    // 1. UPDATE SESSION COUNTS
    setStats(prev => ({
        ...prev,
        sessionCounts: {
            ...prev.sessionCounts,
            [mode]: (prev.sessionCounts?.[mode] || 0) + 1
        }
    }));

    if (isFocusSession) {
      setShowFlowExtend(true);
      
      const durationToAdd = isExtension ? settings.flowDuration : settings.durations.focus;
      const sessionIncrement = isExtension ? 0 : 1;
      const seedIncrement = isExtension ? 0 : 1;
      
      if (seedIncrement > 0) {
          setSeeds(prev => prev + seedIncrement);
      }
      
      const now = new Date();
      // FIX: Use local date string instead of UTC to prevent timezone overlaps
      const today = now.toLocaleDateString('en-CA'); 
      const hour = now.getHours();
      const dayOfWeek = now.getDay(); // 0 = Sunday
      
      setStats(prev => {
        const newHistory = { ...prev.dailyHistory }; 
        const oldTodayTotal = newHistory[today] || 0;
        const newTodayTotal = oldTodayTotal + durationToAdd;
        newHistory[today] = newTodayTotal; 
        
        // Update Hourly (Aggregate)
        const newHourly = [...prev.hourlyActivity]; 
        newHourly[hour] += durationToAdd;

        // Update Weekly Heatmap (Day x Hour)
        // Ensure structure exists (safety check)
        const newWeeklyHourly = prev.weeklyHourly ? prev.weeklyHourly.map(row => [...row]) : Array.from({length:7}, () => new Array(24).fill(0));
        newWeeklyHourly[dayOfWeek][hour] += durationToAdd;
        
        let newStreak = prev.streak;
        if (prev.lastActiveDate !== today) { 
            const y = new Date(now); 
            y.setDate(y.getDate() - 1); 
            // FIX: Use local date for streak check as well
            const yesterday = y.toLocaleDateString('en-CA');
            if (prev.lastActiveDate === yesterday) newStreak += 1; 
            else if (prev.lastActiveDate !== today) newStreak = 1; 
        }

        const newBestStreak = Math.max(prev.bestStreak || 0, newStreak);
        
        const goal = settings.dailyGoal;
        const metGoalBefore = oldTodayTotal >= goal;
        const metGoalNow = newTodayTotal >= goal;
        const perfectDaysIncrement = (!metGoalBefore && metGoalNow) ? 1 : 0;

        const activeTask = tasks.find(t => t.id === focusedTaskId);
        const activeCategory = activeTask?.category || "General";
        const activePriority = activeTask?.priority || 1;

        const newCategoryDist = { ...prev.categoryDist }; 
        newCategoryDist[activeCategory] = (newCategoryDist[activeCategory] || 0) + durationToAdd;

        const newPriorityDist = { ...prev.priorityDist };
        // FIX: Always update priority distribution if we have a task, handling the stats update here
        if (activeTask) {
             newPriorityDist[activePriority] = (newPriorityDist[activePriority] || 0) + durationToAdd;
        }

        const totalMins = prev.minutes + durationToAdd;
        
        return { 
          ...prev, 
          sessions: prev.sessions + sessionIncrement, 
          minutes: totalMins, 
          dailyHistory: newHistory, 
          hourlyActivity: newHourly,
          weeklyHourly: newWeeklyHourly, // Save new heatmap
          categoryDist: newCategoryDist, 
          priorityDist: newPriorityDist,
          streak: newStreak,
          lastActiveDate: today,
          bestStreak: newBestStreak,
          perfectDays: (prev.perfectDays || 0) + perfectDaysIncrement
        };
      });

      if (focusedTaskId && sessionIncrement > 0) {
        setTasks(prev => prev.map(t => 
          t.id === focusedTaskId 
            ? { ...t, completedPomos: (t.completedPomos || 0) + 1 } 
            : t
        ));
      }
    } else { 
        setStats(prev => ({ ...prev, breaksCompleted: (prev.breaksCompleted || 0) + 1 })); 

        // NEW LOGIC: Auto-start Focus after Short Break
        // If settings allow, and we just finished a 'short' break, trigger focus start.
        if (settings.autoStartBreaks && mode === 'short') {
            setTriggerAutoStart(true);
        }
        // FIX: Reset to Focus mode after Long Break finishes so it exits the break loop
        else if (mode === 'long') {
            timer.setMode('focus');
        }
    }
  };

  const timer = useTimer(settings, handleTimerComplete);

  // NEW: Effect to reliably start the timer when triggered
  useEffect(() => {
    if (triggerAutoStart) {
        timer.startSession('focus');
        setTriggerAutoStart(false);
    }
  }, [triggerAutoStart, timer]);

  // --- NEW BEHAVIORAL WRAPPERS ---

  // 1. Pause Wrapper: Tracks "Interruption Pattern" and "Flow Depth"
  const pauseSession = () => {
    // FIX: Track abandonment immediately when pausing a focus session
    if (timer.mode === 'focus' && timer.isActive) {
        const progress = timer.calculateProgress();
        
        setStats(prev => {
            let bucket = "0-25";
            if (progress > 75) bucket = "75-100";
            else if (progress > 50) bucket = "50-75";
            else if (progress > 25) bucket = "25-50";

            return {
                ...prev,
                totalPauses: (prev.totalPauses || 0) + 1,
                // FIX: Increment abandonedSessions on every pause as requested
                abandonedSessions: (prev.abandonedSessions || 0) + 1,
                pauseDist: {
                    ...(prev.pauseDist || { "0-25": 0, "25-50": 0, "50-75": 0, "75-100": 0 }),
                    [bucket]: ((prev.pauseDist?.[bucket] || 0) + 1)
                }
            };
        });
    }
    
    timer.pauseTimer();
  };

  // 2. Cancel Wrapper: Tracks "Abandonment Rate" (Resetting)
  const cancelSession = () => {
    timer.pauseTimer();
    timer.setMode(timer.mode); // Resets timer to initial state
    
    // Note: If pauseSession handles the abandonment count, we might not need to double count here 
    // unless 'cancel' is distinct from 'pause'. 
    // Assuming cancel is a "hard stop" without a preceding pause, we count it.
    if (timer.mode === 'focus') {
        setStats(prev => ({
            ...prev,
            abandonedSessions: (prev.abandonedSessions || 0) + 1
        }));
    }
  };

  const finishSession = () => {
    setShowFlowExtend(false);
    setIsExtension(false);
    
    // LOGIC FIX: Determine if it's time for a long break
    // We check if the total completed sessions matches the interval
    const isLongBreak = stats.sessions > 0 && (stats.sessions % settings.longBreakInterval === 0);
    const nextMode = isLongBreak ? 'long' : 'short';
    
    timer.finishIntermission('break', nextMode); 
  };

  const extendSession = () => {
    setShowFlowExtend(false);
    setIsExtension(true);
    timer.finishIntermission('extend');
    setStats(prev => ({ ...prev, flowExtensions: (prev.flowExtensions || 0) + 1 }));
  };

  const value = useMemo(() => ({
    timer, 
    showFlowExtend, 
    setShowFlowExtend, 
    finishSession, 
    extendSession,
    pauseSession,  // Export new wrapper
    cancelSession  // Export new wrapper
  }), [timer, showFlowExtend]);

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
};