import React, { createContext, useContext, useState, useMemo } from 'react';
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
  const { setStats, setSeeds } = useStats();
  const { tasks, setTasks, focusedTaskId } = useTasks();
  
  const [showFlowExtend, setShowFlowExtend] = useState(false);
  // NEW: Track if the current running timer is an extension
  const [isExtension, setIsExtension] = useState(false);

  const handleTimerComplete = (mode, isFocusSession) => {
    if (isFocusSession) {
      setShowFlowExtend(true);
      
      // Determine what to add based on whether this was an extension or a full session
      const durationToAdd = isExtension ? settings.flowDuration : settings.durations.focus;
      const sessionIncrement = isExtension ? 0 : 1; // Don't count extension as a new "Session"
      const seedIncrement = isExtension ? 0 : 1;    // Don't award a seed for extension
      
      if (seedIncrement > 0) {
          setSeeds(prev => prev + seedIncrement);
      }
      
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const hour = now.getHours();
      
      setStats(prev => {
        const newHistory = { ...prev.dailyHistory }; 
        // Use the calculated duration (e.g. 15m) instead of the full focus duration (e.g. 25m)
        newHistory[today] = (newHistory[today] || 0) + durationToAdd; 
        
        const newHourly = [...prev.hourlyActivity]; 
        newHourly[hour] += durationToAdd;
        
        let newStreak = prev.streak;
        if (prev.lastActiveDate !== today) { 
            const y = new Date(now); 
            y.setDate(y.getDate() - 1); 
            if (prev.lastActiveDate === y.toISOString().split('T')[0]) newStreak += 1; 
            else if (prev.lastActiveDate !== today) newStreak = 1; 
        }
        
        const activeTaskCategory = tasks.find(t => t.id === focusedTaskId)?.category || "General";
        const newCategoryDist = { ...prev.categoryDist }; 
        newCategoryDist[activeTaskCategory] = (newCategoryDist[activeTaskCategory] || 0) + durationToAdd;
        
        const totalMins = prev.minutes + durationToAdd;
        
        return { 
          ...prev, 
          sessions: prev.sessions + sessionIncrement, // Only increment count if it's a full session
          minutes: totalMins, 
          dailyHistory: newHistory, 
          hourlyActivity: newHourly, 
          categoryDist: newCategoryDist, 
          streak: newStreak, 
          lastActiveDate: today 
        };
      });

      // Only increment Task Pomodoro count if it was a full session
      if (focusedTaskId && sessionIncrement > 0) {
        setTasks(prev => prev.map(t => 
          t.id === focusedTaskId 
            ? { ...t, completedPomos: (t.completedPomos || 0) + 1 } 
            : t
        ));
      }
    } else { 
        setStats(prev => ({ ...prev, breaksCompleted: (prev.breaksCompleted || 0) + 1 })); 
    }
  };

  const timer = useTimer(settings, handleTimerComplete);

  const finishSession = () => {
    setShowFlowExtend(false);
    setIsExtension(false); // Reset extension state for the next session
    timer.finishIntermission('break'); 
  };

  const extendSession = () => {
    setShowFlowExtend(false);
    setIsExtension(true); // Mark the upcoming timer as an extension
    timer.finishIntermission('extend');
    setStats(prev => ({ ...prev, flowExtensions: (prev.flowExtensions || 0) + 1 }));
  };

  const value = useMemo(() => ({
    timer, 
    showFlowExtend, 
    setShowFlowExtend, 
    finishSession, 
    extendSession 
  }), [timer, showFlowExtend]);

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};